# frozen_string_literal: true

require 'pg_query'

module McpServer
  # Layer 1 of the reporting-SQL sandbox: a pg_query AST validator.
  #
  # It is the fast, friendly filter that rejects malformed or out-of-scope queries
  # before they reach the database, returning an actionable reason the LLM can
  # self-correct from. It is NOT the real security boundary: that is the
  # `analytics_reader` Postgres role applied at execution time (layer 2). Because
  # layer 2 sits behind it, layer 1 errs on the side of rejecting anything it
  # cannot prove safe.
  #
  # A query is accepted only if ALL of the following hold:
  #   - it parses as exactly one statement;
  #   - that statement is a top-level SELECT;
  #   - no statement anywhere modifies data (guards `WITH x AS (DELETE ...)`);
  #   - it is not a `SELECT ... INTO`;
  #   - every referenced base relation is either a CTE name in lexical scope or
  #     one of the unqualified reporting tables exposed by GetReportingSqlSchema.
  #     Forbidding the schema/catalog qualifier is what stops
  #     `other_tenant.analytics_fact_x` from bypassing the tenant `search_path`
  #     (the one cross-tenant hole layer 2 cannot close, since the role is granted
  #     on every tenant schema). The CTE exemption is scope-aware: a CTE named
  #     like a real relation (e.g. `pg_user`) does NOT exempt a same-named
  #     reference sitting in another scope, which would otherwise reach an
  #     always-on-search_path catalog such as `pg_catalog.pg_user`;
  #   - every function call is on the pure-function allowlist.
  class SqlSandboxer
    # Pure, side-effect-free functions safe to expose. Anything not listed is
    # rejected with its name, so the list grows from real eval failures rather
    # than guesswork. Casts (`x::int`, `CAST(...)`) are TypeCast nodes, not
    # FuncCalls, so they are unaffected by this list.
    ALLOWED_FUNCTIONS = %w[
      count sum avg min max array_agg string_agg json_agg jsonb_agg
      bool_and bool_or every stddev stddev_pop stddev_samp
      variance var_pop var_samp percentile_cont percentile_disc mode
      corr covar_pop covar_samp
      abs ceil ceiling floor round trunc div mod power sqrt cbrt exp ln log
      sign greatest least width_bucket
      lower upper initcap length char_length character_length
      trim btrim ltrim rtrim lpad rpad left right substr substring
      replace split_part concat concat_ws format reverse repeat
      starts_with position strpos to_char to_number
      regexp_replace regexp_match regexp_matches regexp_split_to_array md5
      date_trunc date_part extract age date
      make_date make_timestamp to_date to_timestamp
      justify_days justify_hours justify_interval
      coalesce nullif
      to_jsonb jsonb_extract_path jsonb_extract_path_text json_extract_path
      jsonb_array_elements jsonb_array_elements_text
      jsonb_build_object jsonb_build_array jsonb_object_keys
      jsonb_array_length json_array_length
      unnest cardinality array_length array_position array_to_string
      row_number rank dense_rank percent_rank cume_dist ntile
      lag lead first_value last_value nth_value
    ].to_set.freeze

    # On success, `normalized_sql` carries the query re-rendered from the parse
    # tree: a single statement, no trailing semicolon or comments, safe for the
    # tool to wrap in a row-capping subquery.
    Result = Data.define(:valid, :error, :normalized_sql) do
      def valid? = valid
    end

    # Raised internally to short-circuit validation; never escapes #validate.
    class Rejected < StandardError; end

    def self.validate(sql) = new(sql).validate

    def initialize(sql)
      @sql = sql.to_s
    end

    def validate
      parsed = ::PgQuery.parse(@sql)
      check_single_top_level_select!(parsed)
      validate_statements!(parsed)
      validate_relations!(parsed.tree, Set.new)
      Result.new(valid: true, error: nil, normalized_sql: parsed.deparse)
    rescue ::PgQuery::ParseError => e
      Result.new(valid: false, error: "Could not parse SQL: #{e.message}", normalized_sql: nil)
    rescue Rejected => e
      Result.new(valid: false, error: e.message, normalized_sql: nil)
    end

    private

    def check_single_top_level_select!(parsed)
      stmts = parsed.tree.stmts
      reject!('Only a single statement is allowed.') unless stmts.length == 1
      reject!('Only a top-level SELECT statement is allowed.') unless stmts.first.stmt.node == :select_stmt
    end

    # Scope-free checks. These ride on pg_query's own walk!, so they are visited
    # no matter how deeply a node is nested.
    def validate_statements!(parsed)
      parsed.walk! do |node|
        case node
        when ::PgQuery::InsertStmt, ::PgQuery::UpdateStmt, ::PgQuery::DeleteStmt, ::PgQuery::MergeStmt
          reject!('Data-modifying statements are not allowed.')
        when ::PgQuery::CopyStmt
          reject!('COPY is not allowed.')
        when ::PgQuery::SelectStmt
          check_no_select_into!(node)
        when ::PgQuery::FuncCall
          check_function!(node)
        end
      end
    end

    # Relation checks must be scope-aware, so they cannot ride on the flat walk!:
    # a CTE name only exempts references inside the lexical scope that defines it.
    # `visible_ctes` is the set of CTE names in scope at `node`; it grows as we
    # descend into a statement carrying a WITH clause and is NOT leaked to sibling
    # or outer scopes (a fresh set per branch). We recurse generically over the
    # protobuf tree so every RangeVar is still reached, exactly as walk! would.
    def validate_relations!(node, visible_ctes)
      visible_ctes |= cte_names_in_scope(node)
      check_relation!(node, visible_ctes) if node.is_a?(::PgQuery::RangeVar)
      each_child_node(node) { |child| validate_relations!(child, visible_ctes) }
    end

    # CTE names introduced by a node's own WITH clause (empty for nodes without
    # one). They are visible to the WITH's own CTE bodies (for inter-CTE and
    # `WITH RECURSIVE` self references) and to the statement that owns the WITH.
    def cte_names_in_scope(node)
      return [] unless node.respond_to?(:with_clause)

      with_clause = node.with_clause
      return [] if with_clause.nil?

      with_clause.ctes.map { |cte| cte.common_table_expr.ctename }
    end

    # Yields each child that is itself a parse-tree node, transparently unwrapping
    # repeated fields and the ubiquitous PgQuery::Node oneof wrapper (whose unset
    # oneof members read back as nil and are skipped). Scalars and enums are
    # ignored. This mirrors the traversal walk! performs, but lets us thread
    # lexical scope through the descent.
    def each_child_node(node)
      node.class.descriptor.each do |field|
        value = node.public_send(field.name)
        next if value.nil?

        if value.is_a?(::Google::Protobuf::RepeatedField)
          value.each { |element| yield element if parse_tree_node?(element) }
        elsif parse_tree_node?(value)
          yield value
        end
      end
    end

    def parse_tree_node?(value)
      value.class.respond_to?(:descriptor)
    end

    def check_no_select_into!(select_stmt)
      reject!('SELECT ... INTO is not allowed.') unless select_stmt.into_clause.nil?
    end

    def check_relation!(range_var, visible_ctes)
      if range_var.schemaname.present? || range_var.catalogname.present?
        reject!("Schema-qualified table references are not allowed: #{qualified_name(range_var)}")
      end

      relname = range_var.relname
      return if visible_ctes.include?(relname)
      return if allowed_tables.include?(relname)

      reject!(
        "Table '#{relname}' is not queryable. Only the reporting tables exposed by " \
        'get_reporting_sql_schema may be referenced, unqualified.'
      )
    end

    # The single source of truth for queryable tables, shared with the schema
    # tool. Referenced lazily to avoid eager constant resolution at load time.
    def allowed_tables
      McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLE_NAMES
    end

    def check_function!(func_call)
      parts = func_call.funcname.map { |part| part.string.sval }
      schema = parts.first.downcase if parts.size > 1
      name = parts.last.downcase

      if schema && schema != 'pg_catalog'
        reject!("Schema-qualified function calls are not allowed: #{parts.join('.')}")
      end

      reject!("Function '#{name}' is not allowed.") unless ALLOWED_FUNCTIONS.include?(name)
    end

    def qualified_name(range_var)
      [range_var.catalogname, range_var.schemaname, range_var.relname].reject(&:empty?).join('.')
    end

    def reject!(message)
      raise Rejected, message
    end
  end
end
