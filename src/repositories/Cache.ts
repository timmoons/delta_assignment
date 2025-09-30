import Redis, * as redis from 'ioredis';

export interface Cacher {
    getOrAdd: <T>(key: string, factoryFn: () => Promise<T>) => Promise<T>;
    invalidateKey: (key: string) => Promise<void>;
}

const DEFAULT_TTL = 30;

export class RedisCacher implements Cacher {
    private readonly client: Redis;

    constructor(options: redis.RedisOptions) {
        this.client = new Redis(options);
    }

    public async getOrAdd<T>(key: string, factoryFn: () => Promise<T>) {
        let cachedValue = await this.client.get(key);
        if (cachedValue === null) {
            cachedValue = JSON.stringify(await factoryFn());
            await this.client.setex(key, DEFAULT_TTL, cachedValue);
        }
        return JSON.parse(cachedValue);
    }

    public async invalidateKey(key: string) {
        await this.client.del(key);
    }
}