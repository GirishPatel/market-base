import { Client } from '@elastic/elasticsearch';
import { logger } from './logger';
import { PRODUCT_INDEX_MAPPINGS } from './elasticsearchMappings';

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

export const setupElasticsearch = async () => {
  try {
    const health = await client.cluster.health();
    logger.info('Elasticsearch connected successfully:', health.status);

    // Create indices if they don't exist
    const productsIndexExists = await client.indices.exists({ index: 'products' });
    if (!productsIndexExists) {
      await client.indices.create({
        index: 'products',
        ...PRODUCT_INDEX_MAPPINGS,
      });
      logger.info('Created products index');
    }
  } catch (error) {
    logger.error('Elasticsearch connection failed:', error);
  }
};

export const elasticsearchClient = client;
export default client;