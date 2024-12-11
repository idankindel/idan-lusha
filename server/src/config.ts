const CONFIG = {
  PORT: 8906,
  MONGO: {
    URI: process.env.MONGO_URI || 'mongodb://mongo:27017',
    DB: 'data',
    COLLECTION: 'parser'
  },
  REDIS: {
    URI: process.env.REDIS_URI || 'redis://redis:6379',
    QUEUE_NAME: 'parser'
  },
  PARSER_LIMIT: 3,
} as const;

export default CONFIG;
