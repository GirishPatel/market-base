import { Client } from '@elastic/elasticsearch';
import { logger } from './logger';

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

export const setupElasticsearch = async () => {
  try {
    const health = await client.cluster.health();
    logger.info('Elasticsearch connected successfully:', health.status);

    // Create indices if they don't exist
    const usersIndexExists = await client.indices.exists({ index: 'users' });
    if (!usersIndexExists) {
      await client.indices.create({
        index: 'users',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              email: { type: 'keyword' },
              name: { type: 'text', analyzer: 'standard' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
      logger.info('Created users index');
    }

    const articlesIndexExists = await client.indices.exists({ index: 'articles' });
    if (!articlesIndexExists) {
      await client.indices.create({
        index: 'articles',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text', analyzer: 'standard' },
              content: { type: 'text', analyzer: 'standard' },
              summary: { type: 'text', analyzer: 'standard' },
              published: { type: 'boolean' },
              authorId: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
      logger.info('Created articles index');
    }
  } catch (error) {
    logger.error('Elasticsearch connection failed:', error);
  }
};

export default client;