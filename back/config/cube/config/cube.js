const PostgresDriver = require('@cubejs-backend/postgres-driver');
const MySqlDriver = require('@cubejs-backend/mysql-driver');
const {Pool} = require('pg');

const {fetchTenants} = require('./utils/citizenlab_db')

const PG_CONNECTION_POOL = new Pool({
  host: 'postgres',
  database: 'cl2_back_development',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
});

module.exports = {
  contextToAppId: ({securityContext}) => {
    const tenantHost = securityContext.tenant_host;

    if (tenantHost) {
      return tenantHost;
    } else {
      throw new Error('Tenant host is missing in security context.');
    }
  },

  dbType: ({dataSource}) => {
    if(dataSource === 'matomo') {
      return 'mysql';
    } else {
      // From documentation:
      // A default data source must exist and be configured. It is used to
      // resolve target query data source for now. This behavior will be
      // changed in future releases.
      return 'postgres';
    }
  },

  driverFactory: ({dataSource}) => {
    if (dataSource === 'matomo') {
      return new MySqlDriver({
        host: process.env.MATOMO_DB_HOST,
        port: process.env.MATOMO_DB_PORT,
        database: process.env.MATOMO_DB_NAME,
        user: process.env.MATOMO_DB_USER,
        password: process.env.MATOMO_DB_PASS,
      });
    } else {
      // From documentation:
      // A default data source must exist and be configured. It is used to
      // resolve target query data source for now. This behavior will be
      // changed in future releases.
      return new PostgresDriver({
        host: process.env.CITIZENLAB_DB_HOST,
        port: process.env.CITIZENLAB_DB_PORT,
        database: process.env.CITIZENLAB_DB_NAME,
        user: process.env.CITIZENLAB_DB_USER,
        password: process.env.CITIZENLAB_DB_PASS,
      });
    }
  },

  scheduledRefreshContexts: async () => {
    const tenantHosts = await fetchTenants(PG_CONNECTION_POOL)

    return tenantHosts.map((tenant) => (
      {
        securityContext: {tenant_host: tenant.host},
        dataSource: 'citizenlab',
      }
    ));
  },
};

