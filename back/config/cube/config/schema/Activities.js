const tenantHost = COMPILE_CONTEXT.securityContext.tenant_host;

cube(`Activities`, {
  dataSource: 'citizenlab',
  sql: `SELECT * FROM ${tenantHost}.activities`,
  
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started  
  },
  
  joins: {},
  
  measures: {
    count: {
      type: `count`,
      drillMembers: [userId, id, itemId, createdAt]
    }
  },
  
  dimensions: {
    userId: {
      sql: `user_id`,
      type: `string`
    },
    
    payload: {
      sql: `payload`,
      type: `string`
    },
    
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true
    },
    
    itemType: {
      sql: `item_type`,
      type: `string`
    },
    
    action: {
      sql: `action`,
      type: `string`
    },
    
    itemId: {
      sql: `item_id`,
      type: `string`
    },
    
    createdAt: {
      sql: `created_at`,
      type: `time`
    },
    
    actedAt: {
      sql: `acted_at`,
      type: `time`
    }
  }
});
