import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DoiService } from './doi.service.js';
import { CrossrefClientService } from './crossref-client.service.js';

describe('DoiService (Block 2 - Crossref Integration)', () => {
  let doiService: DoiService;
  let mockPrisma: any;
  let mockConfigService: any;
  let mockCrossrefClient: any;

  beforeEach(() => {
    mockPrisma = {
      article: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      doiDeposit: {
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        if (key === 'FRONTEND_URL') return 'https://journova.com';
        return defaultValue;
      }),
    };

    mockCrossrefClient = {
      submitDeposit: vi.fn().mockResolvedValue({
        success: true,
        batchId: 'mock-batch-123',
        statusCode: 200,
        responseBody: 'SUCCESS',
      }),
    };

    doiService = new DoiService(mockPrisma, mockConfigService, mockCrossrefClient);
  });

  describe('generateCrossrefXml', () => {
    it('should generate valid Crossref v4.4.2 XML with escaped characters', () => {
      const article = {
        title: 'Research & Development: <Special> Edition',
        slug: 'research-dev-special',
        page_start: '10',
        page_end: '25',
        authors: [
          { author: { full_name: 'Budi Santoso' } },
          { author: { full_name: 'Jane Doe' } },
        ],
      };

      const journal = {
        name: 'Journova Innovation & Technology',
        issn: '2775-1234',
        publisher: 'Journova Press',
        email: 'editor@journova.com',
      };

      const issue = { issue_number: 1, year: 2026 };
      const volume = { volume_number: 2 };
      const doi = '10.1234/journova.v2.i1.research-dev-special';

      const xml = doiService.generateCrossrefXml(article, journal, issue, volume, doi);

      expect(xml).toContain('version="4.4.2"');
      expect(xml).toContain('http://www.crossref.org/schema/4.4.2');
      expect(xml).toContain('<title>Research &amp; Development: &lt;Special&gt; Edition</title>');
      expect(xml).toContain('<full_title>Journova Innovation &amp; Technology</full_title>');
      expect(xml).toContain('<issn media_type="electronic">2775-1234</issn>');
      expect(xml).toContain('<first_page>10</first_page>');
      expect(xml).toContain('<last_page>25</last_page>');
      expect(xml).toContain('<doi>10.1234/journova.v2.i1.research-dev-special</doi>');
      expect(xml).toContain('<resource>https://journova.com/articles/research-dev-special</resource>');
      expect(xml).toContain('<given_name>Budi</given_name>');
      expect(xml).toContain('<surname>Santoso</surname>');
    });
  });

  describe('depositDoi', () => {
    it('should complete deposit workflow and update article doi when Crossref succeeds', async () => {
      const mockArticle = {
        id: 'art-123',
        slug: 'sample-article',
        title: 'Sample Title',
        journal: { doi_prefix: '10.5555', name: 'Journal J', publisher: 'Pub' },
        issue: { issue_number: 1, year: 2026, volume: { volume_number: 1 } },
        authors: [{ author: { full_name: 'Budi Test' } }],
      };

      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
      mockPrisma.doiDeposit.create.mockResolvedValue({ id: 'dep-1' });

      const result = await doiService.depositDoi('art-123');

      expect(mockCrossrefClient.submitDeposit).toHaveBeenCalled();
      expect(mockPrisma.doiDeposit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dep-1' },
          data: expect.objectContaining({ status: 'SUCCESS' }),
        }),
      );
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: 'art-123' },
        data: { doi: '10.5555/journova.v1.i1.sample-article' },
      });
      expect(result).toEqual({ id: 'dep-1' });
    });

    it('should record FAILED status on deposit failure without crashing', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'art-123',
        slug: 'sample-article',
        title: 'Sample Title',
        journal: { doi_prefix: '10.5555', name: 'Journal J' },
        issue: { issue_number: 1, year: 2026, volume: { volume_number: 1 } },
        authors: [],
      });
      mockPrisma.doiDeposit.create.mockResolvedValue({ id: 'dep-2' });
      mockCrossrefClient.submitDeposit.mockResolvedValue({
        success: false,
        errorMessage: 'Invalid credentials HTTP 401',
      });

      await doiService.depositDoi('art-123');

      expect(mockPrisma.doiDeposit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dep-2' },
          data: expect.objectContaining({
            status: 'FAILED',
            error_msg: 'Invalid credentials HTTP 401',
          }),
        }),
      );
    });
  });
});
