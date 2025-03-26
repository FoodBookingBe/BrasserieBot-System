import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getHello(): Promise<string> {
    const cachedHello = await this.cacheManager.get<string>('hello');
    if (cachedHello) {
      return `From cache: ${cachedHello}`;
    }

    const hello = 'Hello World!';
    await this.cacheManager.set('hello', hello, 60 * 1000); // Cache for 1 minute
    return hello;
  }

  async clearHelloCache(): Promise<void> {
    await this.cacheManager.del('hello');
  }
}
