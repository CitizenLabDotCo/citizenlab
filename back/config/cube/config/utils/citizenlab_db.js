
async function query(pgConnectionPool, sqlQuery) {
  const client = await pgConnectionPool.connect();

  try {
    const result = await client.query(sqlQuery);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  fetchTenants: async (pgConnectionPool) => {
    const sql = 'SELECT * FROM "public"."tenants";';
    return query(pgConnectionPool, sql);
  },

  // TODO Watch out: SQL injection
  fetchTenant: async (pgConnectionPool, tenantId) => {
    const sql = `SELECT * FROM "public"."tenants" WHERE "id" = '${tenantId}';`;
    return query(pgConnectionPool, sql);
  },
}

