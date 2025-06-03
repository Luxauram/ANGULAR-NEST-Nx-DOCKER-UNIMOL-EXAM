import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class MicroserviceService {
  private readonly serviceUrls = {
    user: process.env.USER_SERVICE_URL || 'http://host.docker.internal:3001',
    post: process.env.POST_SERVICE_URL || 'http://host.docker.internal:3002',
    feed: process.env.FEED_SERVICE_URL || 'http://host.docker.internal:3003',
    socialGraph:
      process.env.SOCIAL_GRAPH_SERVICE_URL ||
      'http://host.docker.internal:3004',
  };

  constructor(private readonly httpService: HttpService) {}

  /**
   * Effettua una chiamata GET verso un microservizio
   */
  async get(
    service: keyof typeof this.serviceUrls,
    path: string,
    params?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    try {
      const url = `${this.serviceUrls[service]}${path}`;
      console.log(`🔄 GET Request: ${url}`);

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${service} service:`, error.message);
      this.handleServiceError(error, service);
    }
  }

  /**
   * Effettua una chiamata POST verso un microservizio
   */
  async post(
    service: keyof typeof this.serviceUrls,
    path: string,
    data: any,
    headers?: Record<string, string>
  ): Promise<any> {
    console.log('🚀 API GATEWAY - Making request');
    console.log('🚀 Service:', service);
    console.log('🚀 URL:', `${this.serviceUrls[service]}${path}`);
    console.log('🚀 Data:', JSON.stringify(data, null, 2));
    console.log('🚀 Headers:', headers);

    try {
      const url = `${this.serviceUrls[service]}${path}`;
      console.log(`🔄 POST Request: ${url}`, { data });

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${service} service:`, error.message);
      console.error('Error details:', error);
      this.handleServiceError(error, service);
    }
  }

  /**
   * Effettua una chiamata PUT verso un microservizio
   */
  async put(
    service: keyof typeof this.serviceUrls,
    path: string,
    data: any,
    headers?: Record<string, string>
  ): Promise<any> {
    try {
      const url = `${this.serviceUrls[service]}${path}`;
      console.log(`🔄 PUT Request: ${url}`, { data });

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.put(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${service} service:`, error.message);
      this.handleServiceError(error, service);
    }
  }

  /**
   * Effettua una chiamata PATCH verso un microservizio
   */
  async patch(
    service: keyof typeof this.serviceUrls,
    path: string,
    data: any,
    headers?: Record<string, string>
  ): Promise<any> {
    try {
      const url = `${this.serviceUrls[service]}${path}`;
      console.log(`🔄 PATCH Request: ${url}`, { data });

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.patch(url, data, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${service} service:`, error.message);
      this.handleServiceError(error, service);
    }
  }

  /**
   * Effettua una chiamata DELETE verso un microservizio
   */
  async delete(
    service: keyof typeof this.serviceUrls,
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    try {
      const url = `${this.serviceUrls[service]}${path}`;
      console.log(`🔄 DELETE Request: ${url}`);

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.delete(url, {
          data, // AGGIUNTO: supporto per body
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${service} service:`, error.message);
      this.handleServiceError(error, service);
    }
  }

  /**
   * Gestisce gli errori delle chiamate ai microservizi
   */
  private handleServiceError(error: any, serviceName: string): never {
    if (error.response) {
      // Il microservizio ha risposto con un errore
      throw new HttpException(
        error.response.data?.message ||
          error.response.data ||
          `Error from ${serviceName} service`,
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    } else if (error.request) {
      // Il microservizio non è raggiungibile
      throw new HttpException(
        `${serviceName} service is not available`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    } else {
      // Errore generico
      throw new HttpException(
        `Internal error calling ${serviceName} service`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
