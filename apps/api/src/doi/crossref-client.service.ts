import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CrossrefDepositResult {
  success: boolean;
  batchId: string;
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
}

@Injectable()
export class CrossrefClientService {
  private readonly logger = new Logger(CrossrefClientService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Mengirim XML payload ke Crossref endpoint melalui multipart/form-data.
   * Jika CROSSREF_DEPOSIT_MODE='mock', simulasi deposit tanpa memanggil endpoint eksternal.
   */
  async submitDeposit(batchId: string, xmlPayload: string): Promise<CrossrefDepositResult> {
    const mode = this.configService.get<string>('CROSSREF_DEPOSIT_MODE', 'mock');
    const endpoint = this.configService.get<string>(
      'CROSSREF_ENDPOINT',
      'https://test.crossref.org/servlet/deposit',
    );
    const username = this.configService.get<string>('CROSSREF_USERNAME', '');
    const password = this.configService.get<string>('CROSSREF_PASSWORD', '');

    if (mode === 'mock') {
      this.logger.log(`[Crossref MOCK] Depositing batchId=${batchId} (mock mode enabled)`);
      return {
        success: true,
        batchId,
        statusCode: 200,
        responseBody: `SUCCESS: Mock deposit accepted for batch ${batchId}`,
      };
    }

    // Live mode: POST multipart/form-data ke Crossref servlet
    try {
      this.logger.log(`[Crossref LIVE] Sending batchId=${batchId} to ${endpoint}`);

      const formData = new FormData();
      formData.append('operation', 'doMDUpload');
      formData.append('login_id', username);
      formData.append('login_passwd', password);
      
      const xmlBlob = new Blob([xmlPayload], { type: 'application/xml' });
      formData.append('fname', xmlBlob, `${batchId}.xml`);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.logger.error(
          `[Crossref LIVE] Deposit failed with status ${response.status}: ${responseText}`,
        );
        return {
          success: false,
          batchId,
          statusCode: response.status,
          responseBody: responseText,
          errorMessage: `HTTP ${response.status}: ${responseText.slice(0, 300)}`,
        };
      }

      this.logger.log(`[Crossref LIVE] Deposit successfully submitted for batchId=${batchId}`);
      return {
        success: true,
        batchId,
        statusCode: response.status,
        responseBody: responseText,
      };
    } catch (error: any) {
      this.logger.error(`[Crossref LIVE] Network error during deposit: ${error.message}`);
      return {
        success: false,
        batchId,
        errorMessage: error.message || 'Unknown network error during Crossref deposit',
      };
    }
  }
}
