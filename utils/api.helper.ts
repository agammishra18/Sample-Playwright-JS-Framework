import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { getEnvironmentConfig } from '../config/environment.config';
import { Logger } from './logger';

/**
 * Thin wrapper around Playwright's APIRequestContext that:
 *  - resolves the base URL from environment config
 *  - injects auth headers
 *  - logs each request/response line
 *
 * Call `ApiClient.create()` from a test or a fixture; dispose with `client.dispose()`.
 */
export class ApiClient {
  private constructor(private readonly ctx: APIRequestContext) {}

  static async create(extraHeaders: Record<string, string> = {}): Promise<ApiClient> {
    const env = getEnvironmentConfig();
    const ctx = await request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'x-api-key': env.apiToken,
        ...extraHeaders,
      },
    });
    return new ApiClient(ctx);
  }

  async get(path: string): Promise<APIResponse> {
    Logger.step(`GET ${path}`);
    const res = await this.ctx.get(path);
    Logger.debug(`GET ${path} -> ${res.status()}`);
    return res;
  }

  async post<T>(path: string, body: T): Promise<APIResponse> {
    Logger.step(`POST ${path}`);
    const res = await this.ctx.post(path, { data: body });
    Logger.debug(`POST ${path} -> ${res.status()}`);
    return res;
  }

  async put<T>(path: string, body: T): Promise<APIResponse> {
    Logger.step(`PUT ${path}`);
    const res = await this.ctx.put(path, { data: body });
    Logger.debug(`PUT ${path} -> ${res.status()}`);
    return res;
  }

  async delete(path: string): Promise<APIResponse> {
    Logger.step(`DELETE ${path}`);
    const res = await this.ctx.delete(path);
    Logger.debug(`DELETE ${path} -> ${res.status()}`);
    return res;
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }
}
