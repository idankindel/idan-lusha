import { RedisClientType } from 'redis';
import { redisManager } from '../db/redis'; // Import the RedisManager instance
import { PraserBl } from '../apis/parser/parser.bl';
import CONFIG from '../../config';
import { TQueueTask } from '../models/types';

export class QueuesManager {
    private queueName: string;
    private redis: RedisClientType;

    public async init(): Promise<void> {
        console.log('Initializing QueuesManager...');
        this.queueName = CONFIG.REDIS.QUEUE_NAME;
        this.redis = await redisManager.getClient();
    }

    public async addToQueue(task: TQueueTask): Promise<void> {
        await this.redis.rPush(this.queueName, JSON.stringify(task));
        console.log(`Added to queue: ${task.link}`);
    }

    public async processQueue(): Promise<void> {
        try {
            const queueItem = await this.redis.lPop(this.queueName);

            if (!queueItem) {
                console.log('Queue is empty. Stopping queue processor.');
                return;
            }

            const { link } = JSON.parse(queueItem) as TQueueTask;

            console.log(`Processing link: ${link}`);

            const linkData = await PraserBl.parseUrl(link);

            if (linkData) {
                for (const subLink of linkData.links) {
                    await this.addToQueue({ link: subLink });
                }
            }

            // Continue processing the next item
            await this.processQueue();
        } catch (error) {
            console.error('Error in queue processing', error);
        }
    }

}

export const queuesManager = new QueuesManager();
