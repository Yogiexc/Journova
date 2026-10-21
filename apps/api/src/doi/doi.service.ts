import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DoiDepositStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CrossrefClientService } from './crossref-client.service.js';

@Injectable()
export class DoiService {
  private readonly logger = new Logger(DoiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly crossrefClient: CrossrefClientService,
  ) {}

  /**
   * Escape special characters for safe XML output
   */
  private escapeXml(unsafe: string | null | undefined): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generates a Crossref schema v4.4.2 compliant XML payload for an article.
   */
  generateCrossrefXml(article: any, journal: any, issue: any, volume: any, doi: string): string {
    const timestamp = Date.now();
    const batchId = crypto.randomUUID();
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    const publisherName = this.escapeXml(journal.publisher || 'Journova');
    const depositorEmail = this.escapeXml(journal.email || 'admin@journova.local');
    const journalTitle = this.escapeXml(journal.name);
    const articleTitle = this.escapeXml(article.title);
    const pubYear = issue.year || new Date().getFullYear();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.4.2" xmlns="http://www.crossref.org/schema/4.4.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schemas/crossref4.4.2.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${publisherName}</depositor_name>
      <email_address>${depositorEmail}</email_address>
    </depositor>
    <registrant>${publisherName}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${journalTitle}</full_title>
        ${journal.issn ? `<issn media_type="electronic">${this.escapeXml(journal.issn)}</issn>` : ''}
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <year>${pubYear}</year>
        </publication_date>
        <journal_volume>
          <volume>${volume.volume_number}</volume>
        </journal_volume>
        <issue>${issue.issue_number}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${articleTitle}</title>
        </titles>
        <contributors>`;

    if (article.authors && article.authors.length > 0) {
      article.authors.forEach((aa: any, index: number) => {
        const seq = index === 0 ? 'first' : 'additional';
        const rawName = aa.author?.full_name || 'Author';
        const parts = rawName.trim().split(/\s+/);
        const givenName = this.escapeXml(parts[0]);
        const surname = this.escapeXml(parts.slice(1).join(' ') || parts[0]);

        xml += `
          <person_name sequence="${seq}" contributor_role="author">
            <given_name>${givenName}</given_name>
            <surname>${surname}</surname>
          </person_name>`;
      });
    }

    xml += `
        </contributors>
        <publication_date media_type="online">
          <year>${pubYear}</year>
        </publication_date>
        ${article.page_start ? `<pages><first_page>${this.escapeXml(article.page_start)}</first_page>${article.page_end ? `<last_page>${this.escapeXml(article.page_end)}</last_page>` : ''}</pages>` : ''}
        <doi_data>
          <doi>${this.escapeXml(doi)}</doi>
          <resource>${frontendUrl}/articles/${this.escapeXml(article.slug)}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;

    return xml;
  }

  async depositDoi(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        journal: true,
        issue: {
          include: { volume: true },
        },
        authors: {
          include: { author: true },
          orderBy: { author_order: 'asc' },
        },
      },
    });

    if (!article) throw new NotFoundException('Article not found');
    if (!article.issue || !article.issue.volume) {
      throw new Error('Article must be assigned to an issue and volume before DOI deposit');
    }

    const prefix = article.journal.doi_prefix || '10.1234';
    const doi = `${prefix}/journova.v${article.issue.volume.volume_number}.i${article.issue.issue_number}.${article.slug}`;

    const xmlPayload = this.generateCrossrefXml(
      article,
      article.journal,
      article.issue,
      article.issue.volume,
      doi,
    );
    const batchId = crypto.randomUUID();

    // 1. Simpan record deposit dengan status PENDING
    const deposit = await this.prisma.doiDeposit.create({
      data: {
        article_id: articleId,
        batch_id: batchId,
        status: DoiDepositStatus.PENDING,
        xml_payload: xmlPayload,
      },
    });

    try {
      this.logger.log(`Submitting DOI deposit for article ${articleId} (batch ${batchId})...`);

      // 2. Kirim payload via CrossrefClientService (mendukung mock dan live HTTPS upload)
      const result = await this.crossrefClient.submitDeposit(batchId, xmlPayload);

      if (result.success) {
        // Status SUBMITTED dan catat response Crossref
        await this.prisma.doiDeposit.update({
          where: { id: deposit.id },
          data: {
            status: DoiDepositStatus.SUBMITTED,
            response_body: result.responseBody ? result.responseBody.slice(0, 1000) : null,
          },
        });

        // Set DOI dan update status SUCCESS untuk article
        await this.prisma.doiDeposit.update({
          where: { id: deposit.id },
          data: { status: DoiDepositStatus.SUCCESS },
        });

        await this.prisma.article.update({
          where: { id: articleId },
          data: { doi },
        });

        this.logger.log(`DOI ${doi} registered successfully for article ${articleId}`);
      } else {
        throw new Error(result.errorMessage || 'Deposit rejected by Crossref');
      }
    } catch (error: any) {
      this.logger.error(`Failed to deposit DOI: ${error.message}`);
      await this.prisma.doiDeposit.update({
        where: { id: deposit.id },
        data: {
          status: DoiDepositStatus.FAILED,
          error_msg: error.message,
        },
      });
    }

    return deposit;
  }

  async retryDeposit(articleId: string) {
    return this.depositDoi(articleId);
  }

  async getDepositStatus(articleId: string) {
    return this.prisma.doiDeposit.findFirst({
      where: { article_id: articleId },
      orderBy: { created_at: 'desc' },
    });
  }
}
