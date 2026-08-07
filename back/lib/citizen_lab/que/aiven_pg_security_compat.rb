# frozen_string_literal: true

module CitizenLab
  module Que
    # Replaces que's `clean_lockers` query for PostgreSQL protected by the
    # aiven-pg-security extension (e.g. Scaleway Managed Database).
    #
    # que's default `clean_lockers` query (que/lib/que/locker.rb) crashes the
    # worker at startup with:
    #   ERROR: Modifying pg_authid or pg_auth_members is not allowed in elevated context
    #
    # It is a DELETE that references the `pg_stat_activity` view. In PostgreSQL
    # that view is defined as a LEFT JOIN against `pg_authid` (to resolve the
    # `usename` column), so the DELETE's query plan contains `pg_authid`. The
    # gatekeeper forbids any modifying statement whose plan touches `pg_authid`
    # in an "elevated context" (the managed view runs as a SECURITY DEFINER
    # superuser).
    #
    # que only reads the `pid` column, so the `pg_authid` join is unnecessary.
    # The replacement query reads from the raw `pg_stat_get_activity()` function
    # that the view itself is built on: same rows, same pids, no `pg_authid`
    # join.
    module AivenPgSecurityCompat
      CLEAN_LOCKERS_SQL = <<~SQL.squish
        DELETE FROM public.que_lockers
        WHERE pid = pg_backend_pid()
           OR NOT EXISTS (
             SELECT 1 FROM pg_stat_get_activity(NULL) s WHERE s.pid = public.que_lockers.pid
           )
      SQL

      def self.apply!
        ::Que::SQL[:clean_lockers] = CLEAN_LOCKERS_SQL
      end
    end
  end
end
