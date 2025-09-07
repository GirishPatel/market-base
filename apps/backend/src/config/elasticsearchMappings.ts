export const PRODUCT_INDEX_MAPPINGS = {
  settings: {
    analysis: {
      analyzer: {
        suggest_analyzer: {
          tokenizer: 'keyword',
          filter: ['lowercase', 'edge_ngram_filter']
        },
        search_analyzer: {
          tokenizer: 'keyword', 
          filter: ['lowercase']
        }
      },
      filter: {
        edge_ngram_filter: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 20
        }
      }
    }
  },
  mappings: {
    properties: {
      id: { type: 'integer' },
      title: { 
        type: 'text', 
        analyzer: 'standard',
        fields: {
          suggest: {
            type: 'text',
            analyzer: 'suggest_analyzer',
            search_analyzer: 'search_analyzer'
          }
        }
      },
      description: { type: 'text', analyzer: 'standard' },
      category: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: {
            type: 'text',
            analyzer: 'suggest_analyzer',
            search_analyzer: 'search_analyzer'
          }
        }
      },
      brand: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: {
            type: 'text',
            analyzer: 'suggest_analyzer',
            search_analyzer: 'search_analyzer'
          }
        }
      },
      tags: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: {
            type: 'text',
            analyzer: 'suggest_analyzer',
            search_analyzer: 'search_analyzer'
          }
        }
      },
      price: { type: 'float' },
      stock: { type: 'integer' },
      rating: { type: 'float' },
      availabilityStatus: { type: 'keyword' },
      review_count: { type: 'integer' },
      discountPercentage: { type: 'float' },
      thumbnail: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  }
} as const;