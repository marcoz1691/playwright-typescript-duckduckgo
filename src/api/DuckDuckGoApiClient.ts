import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { InstantAnswerResponse } from './types/instantAnswer';

export interface ApiResult<T> {
  status: number;
  contentType: string;
  body: T;
  raw: APIResponse;
}

export class DuckDuckGoApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // IMPROVEMENT: add retry with backoff for 429/5xx and validate the body against a schema (zod/ajv).
  async getInstantAnswer(query: string): Promise<ApiResult<InstantAnswerResponse>> {
    const response = await this.request.get('/', {
      params: { q: query, format: 'json' },
    });

    // The API answers 202 with "application/x-javascript", so response.json() is not reliable
    // across Playwright versions; parsing the text explicitly gives a clearer error if it breaks.
    const text = await response.text();
    let body: InstantAnswerResponse;
    try {
      body = JSON.parse(text) as InstantAnswerResponse;
    } catch {
      throw new Error(
        `Instant Answer API did not return JSON (status ${response.status()}): ${text.slice(0, 200)}`,
      );
    }

    return {
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
      body,
      raw: response,
    };
  }
}
