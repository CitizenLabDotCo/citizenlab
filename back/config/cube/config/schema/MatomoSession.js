cube(`MatomoSession`, {
  dataSource: `matomo`,
  sql: `SELECT * FROM matomo_database.matomo_session`,
  
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started  
  },
  
  joins: {
    
  },
  
  measures: {
    count: {
      type: `count`,
      drillMembers: [id]
    }
  },
  
  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true
    },
    
    data: {
      sql: `data`,
      type: `string`
    }
  }
});
