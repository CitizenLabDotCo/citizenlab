cube(`MatomoLogVisit`, {
  dataSource: `matomo`,
  sql: `SELECT * FROM matomo_database.matomo_log_visit`,
  
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started  
  },
  
  joins: {
    
  },
  
  measures: {
    count: {
      type: `count`,
      drillMembers: [idvisitor, configId, userId, refererName, configBrowserName, locationCity, locationCountry]
    }
  },
  
  dimensions: {
    idvisitor: {
      sql: `idvisitor`,
      type: `string`
    },
    
    configId: {
      sql: `config_id`,
      type: `string`
    },
    
    locationIp: {
      sql: `location_ip`,
      type: `string`
    },
    
    userId: {
      sql: `user_id`,
      type: `string`
    },
    
    refererKeyword: {
      sql: `referer_keyword`,
      type: `string`
    },
    
    refererName: {
      sql: `referer_name`,
      type: `string`
    },
    
    refererUrl: {
      sql: `referer_url`,
      type: `string`
    },
    
    locationBrowserLang: {
      sql: `location_browser_lang`,
      type: `string`
    },
    
    configBrowserEngine: {
      sql: `config_browser_engine`,
      type: `string`
    },
    
    configBrowserName: {
      sql: `config_browser_name`,
      type: `string`
    },
    
    configBrowserVersion: {
      sql: `config_browser_version`,
      type: `string`
    },
    
    configDeviceBrand: {
      sql: `config_device_brand`,
      type: `string`
    },
    
    configDeviceModel: {
      sql: `config_device_model`,
      type: `string`
    },
    
    configOs: {
      sql: `config_os`,
      type: `string`
    },
    
    configOsVersion: {
      sql: `config_os_version`,
      type: `string`
    },
    
    configResolution: {
      sql: `config_resolution`,
      type: `string`
    },
    
    locationCity: {
      sql: `location_city`,
      type: `string`
    },
    
    locationCountry: {
      sql: `location_country`,
      type: `string`
    },
    
    locationRegion: {
      sql: `location_region`,
      type: `string`
    },
    
    customDimension1: {
      sql: `custom_dimension_1`,
      type: `string`,
      title: `Custom Dimension 1`
    },
    
    customDimension2: {
      sql: `custom_dimension_2`,
      type: `string`,
      title: `Custom Dimension 2`
    },
    
    customDimension3: {
      sql: `custom_dimension_3`,
      type: `string`,
      title: `Custom Dimension 3`
    },
    
    customDimension4: {
      sql: `custom_dimension_4`,
      type: `string`,
      title: `Custom Dimension 4`
    },
    
    customDimension5: {
      sql: `custom_dimension_5`,
      type: `string`,
      title: `Custom Dimension 5`
    },
    
    visitLastActionTime: {
      sql: `visit_last_action_time`,
      type: `time`
    },
    
    visitFirstActionTime: {
      sql: `visit_first_action_time`,
      type: `time`
    },
    
    visitorLocaltime: {
      sql: `visitor_localtime`,
      type: `time`
    }
  }
});
