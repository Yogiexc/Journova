import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DoiDepositStatus } from '@prisma/client';
import * as crypto from 'crypto';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class DoiService {
  private readonly logger = new Logger(DoiService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Generates a basic Crossref XML payload for an article.
   */
  generateCrossrefXml(article: any, journal: any, issue: any, volume: any, doi: string): string {
    const timestamp = Date.now();
    const batchId = crypto.randomUUID();
    
    // Simplistic XML mapping for MVP
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.3.7" xmlns="http://www.crossref.org/schema/4.3.7" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/4.3.7 http://www.crossref.org/schemas/crossref4.3.7.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${journal.publisher || 'Journova'}</depositor_name>
      <email_address>${journal.email || 'admin@journova.local'}</email_address>
    </depositor>
    <registrant>${journal.publisher || 'Journova'}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${journal.name}</full_title>
        ${journal.issn ? `<issn media_type="print">${journal.issn}</issn>` : ''}
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <year>${issue.year}</year>
        </publication_date>
        <journal_volume>
          <volume>${volume.volume_number}</volume>
        </journal_volume>
        <issue>${issue.issue_number}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${article.title}</title>
        </titles>
        <contributors>`;

    if (article.authors && article.authors.length > 0) {
      article.authors.forEach((aa: any, index: number) => {
        const seq = index === 0 ? 'first' : 'additional';
        xml += `
          <person_name sequence="${seq}" contributor_role="author">
            <given_name>${aa.author.full_name.split(' ')[0]}</given_name>
            <surname>${aa.author.full_name.split(' ').slice(1).join(' ') || aa.author.full_name}</surname>
          </person_name>`;
      });
    }

    xml += `
        </contributors>
        <publication_date media_type="online">
          <year>${new Date().getFullYear()}</year>
        </publication_date>
        ${article.page_start ? `<pages><first_page>${article.page_start}</first_page><last_page>${article.page_end}</last_page></pages>` : ''}
        <doi_data>
          <doi>${doi}</doi>
          <resource>${this.configService.get<string>('FRONTEND_URL')}/articles/${article.slug}</resource>
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
          include: { volume: true }
        },
        authors: {
          include: { author: true },
          orderBy: { author_order: 'asc' }
        }
      }
    });

    if (!article) throw new NotFoundException('Article not found');
    if (!article.issue || !article.issue.volume) throw new Error('Article must be assigned to an issue and volume');

    const prefix = article.journal.doi_prefix || '10.1234';
    // Format: 10.1234/journova.vX.iY.slug
    const doi = `${prefix}/journova.v${article.issue.volume.volume_number}.i${article.issue.issue_number}.${article.slug}`;

    const xmlPayload = this.generateCrossrefXml(article, article.journal, article.issue, article.issue.volume, doi);
    const batchId = crypto.randomUUID();

    // Create deposit record
    const deposit = await this.prisma.doiDeposit.create({
      data: {
        article_id: articleId,
        batch_id: batchId,
        status: DoiDepositStatus.PENDING,
        xml_payload: xmlPayload
      }
    });

    try {
      this.logger.log(`Depositing DOI ${doi} for article ${articleId}...`);
      
      // MOCK API CALL for MVP
      // In production, we would POST to https://api.crossref.org/deposits
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      const isMockSuccess = true; // Simulating a successful request

      if (isMockSuccess) {
        await this.prisma.doiDeposit.update({
          where: { id: deposit.id },
          data: { status: DoiDepositStatus.SUBMITTED }
        });

        // Normally Crossref is async, but for MVP mock, let's simulate the polling success immediately
        await this.simulateCrossrefPolling(deposit.id, doi);
      } else {
        throw new Error('Mock API request failed');
      }

    } catch (error: any) {
      this.logger.error(`Failed to deposit DOI: ${error.message}`);
      await this.prisma.doiDeposit.update({
        where: { id: deposit.id },
        data: { 
          status: DoiDepositStatus.FAILED,
          error_msg: error.message
        }
      });
    }

    return deposit;
  }

  // Simulates the async checking of a deposit status
  private async simulateCrossrefPolling(depositId: string, doi: string) {
    setTimeout(async () => {
      try {
        const deposit = await this.prisma.doiDeposit.findUnique({ where: { id: depositId } });
        if (!deposit) return;

        // Mock success
        await this.prisma.doiDeposit.update({
          where: { id: depositId },
          data: { status: DoiDepositStatus.SUCCESS }
        });

        await this.prisma.article.update({
          where: { id: deposit.article_id },
          data: { doi }
        });

        this.logger.log(`DOI ${doi} successfully registered for article ${deposit.article_id}`);
      } catch (err) {
        this.logger.error(`Failed to complete mock polling: ${err}`);
      }
    }, 3000);
  }

  async retryDeposit(articleId: string) {
    return this.depositDoi(articleId);
  }

  async getDepositStatus(articleId: string) {
    const deposit = await this.prisma.doiDeposit.findFirst({
      where: { article_id: articleId },
      orderBy: { created_at: 'desc' }
    });
    return deposit;
  }
}
