import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      // Removed unnecessary async
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        // Ensure port is a number
        const port = parseInt(configService.get<string>('REDIS_PORT') || '6379', 10);
        // Ensure ttl is a number
        const ttl = parseInt(configService.get<string>('CACHE_TTL') || '60', 10);

        return {
          store: redisStore,
          host: host,
          port: port,
          ttl: ttl, // seconds
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    CoreModule,
    PrismaModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
