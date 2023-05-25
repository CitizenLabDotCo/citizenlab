# frozen_string_literal: true

class UpdateQueTablesToVersion5 < ActiveRecord::Migration[6.1]
  def up
    return unless Apartment::Tenant.current == 'public'

    # See the comment on DEV_QUE_SQL_MIGRATION_5 for why we need to do this.
    Que.execute(DEV_QUE_SQL_MIGRATION_5)
  end

  def down
    return unless Apartment::Tenant.current == 'public'

    Que.migrate!(version: 4)
  end

  # We need to run a slightly different migration because the trigger `que_job_notify`
  # is sometimes missing, which causes the following error:
  # PG::UndefinedObject: ERROR: trigger "que_job_notify" for table "que_jobs" does not exist.
  #
  # We haven't been able to explain why this error occurs in the production and staging
  # environments. However, in development and test environments, this issue arises because schema.rb
  # cannot accurately represent certain database constructs, such as triggers and functions.
  # Therefore, a simple `db:reset` which we run regularly locally removes those objects.
  #
  # You can find the original migration here:
  # https://github.com/que-rb/que/blob/v1.3.1/lib/que/migrations/5/up.sql
  # The only difference is the addition of "IF EXISTS" clauses in the DROP statements.
  DEV_QUE_SQL_MIGRATION_5 = <<~SQL
    DROP TRIGGER IF EXISTS que_job_notify ON que_jobs;
    DROP FUNCTION IF EXISTS que_job_notify();
    
    ALTER TABLE que_jobs
      ADD COLUMN job_schema_version INTEGER DEFAULT 1;
    
    ALTER TABLE que_lockers
      ADD COLUMN job_schema_version INTEGER DEFAULT 1;
    
    CREATE INDEX que_poll_idx_with_job_schema_version
      ON que_jobs (job_schema_version, queue, priority, run_at, id)
      WHERE (finished_at IS NULL AND expired_at IS NULL);
    
    CREATE FUNCTION que_job_notify() RETURNS trigger AS $$
      DECLARE
        locker_pid integer;
        sort_key json;
      BEGIN
        -- Don't do anything if the job is scheduled for a future time.
        IF NEW.run_at IS NOT NULL AND NEW.run_at > now() THEN
          RETURN null;
        END IF;
    
        -- Pick a locker to notify of the job's insertion, weighted by their number
        -- of workers. Should bounce pseudorandomly between lockers on each
        -- invocation, hence the md5-ordering, but still touch each one equally,
        -- hence the modulo using the job_id.
        SELECT pid
        INTO locker_pid
        FROM (
          SELECT *, last_value(row_number) OVER () + 1 AS count
          FROM (
            SELECT *, row_number() OVER () - 1 AS row_number
            FROM (
              SELECT *
              FROM public.que_lockers ql, generate_series(1, ql.worker_count) AS id
              WHERE
                listening AND
                queues @> ARRAY[NEW.queue] AND
                ql.job_schema_version = NEW.job_schema_version
              ORDER BY md5(pid::text || id::text)
            ) t1
          ) t2
        ) t3
        WHERE NEW.id % count = row_number;
    
        IF locker_pid IS NOT NULL THEN
          -- There's a size limit to what can be broadcast via LISTEN/NOTIFY, so
          -- rather than throw errors when someone enqueues a big job, just
          -- broadcast the most pertinent information, and let the locker query for
          -- the record after it's taken the lock. The worker will have to hit the
          -- DB in order to make sure the job is still visible anyway.
          SELECT row_to_json(t)
          INTO sort_key
          FROM (
            SELECT
              'job_available' AS message_type,
              NEW.queue       AS queue,
              NEW.priority    AS priority,
              NEW.id          AS id,
              -- Make sure we output timestamps as UTC ISO 8601
              to_char(NEW.run_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS run_at
          ) t;
    
          PERFORM pg_notify('que_listener_' || locker_pid::text, sort_key::text);
        END IF;
    
        RETURN null;
      END
    $$
    LANGUAGE plpgsql;
    
    CREATE TRIGGER que_job_notify
      AFTER INSERT ON que_jobs
      FOR EACH ROW
      EXECUTE PROCEDURE public.que_job_notify();
  SQL
end
