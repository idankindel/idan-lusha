import { createClient, RedisClientType } from 'redis';
import CONFIG from '../../config';

class RedisManager {
    private redisClient: RedisClientType | null = null;

    public async initialize(): Promise<void> {
        if (!this.redisClient) {
            this.redisClient = createClient({ url: CONFIG.REDIS.URI });

            this.redisClient.on('connect', () => {
                console.log('Connected to Redis');
            });

            this.redisClient.on('error', (error) => {
                console.error('Redis connection error', error);
            });

            await this.redisClient.connect();
        }
    }

    public async getClient(): Promise<RedisClientType> {
        if (!this.redisClient) {
            await this.initialize();
        }
        return this.redisClient;
    }

    public async disconnect(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.disconnect();
            this.redisClient = null;
            console.log('Disconnected from Redis');
        }
    }
}

export const redisManager = new RedisManager();
