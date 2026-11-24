# frozen_string_literal: true

module CitizenLab
  # Implements a (binary) lock on the top of PostgreSQL advisory locks.
  # Inspired from: https://www.kostolansky.sk/posts/postgresql-advisory-locks/
  module LockManager
    module_function

    # @param [String] lock_name
    def try_with_transaction_lock(lock_name)
      lock_id = Zlib.crc32(lock_name)
      ActiveRecord::Base.transaction do
        result = ActiveRecord::Base.connection.execute("SELECT pg_try_advisory_xact_lock(#{lock_id})")
        raise FailedToLock unless result.first['pg_try_advisory_xact_lock']

        yield
      end
    end

    # Waits until the lock is free. The lock is held until the outermost
    # transaction ends, so callers inside a transaction keep it until commit.
    # @param [String] lock_name
    # @param [ActiveSupport::Duration, nil] timeout raises
    #   ActiveRecord::LockWaitTimeout if the lock is not free by then.
    def with_transaction_lock(lock_name, timeout: nil)
      lock_id = Zlib.crc32(lock_name)
      ActiveRecord::Base.transaction do
        connection = ActiveRecord::Base.connection
        if timeout
          # Only the wait for this lock is bounded: the previous timeout is
          # restored for the rest of the transaction.
          previous_timeout = connection.select_value("SELECT current_setting('lock_timeout')")
          connection.execute("SELECT set_config('lock_timeout', '#{timeout.in_milliseconds.to_i}ms', true)")
        end
        connection.execute("SELECT pg_advisory_xact_lock(#{lock_id})")
        connection.execute("SELECT set_config('lock_timeout', #{connection.quote(previous_timeout)}, true)") if timeout
        yield
      end
    end

    class FailedToLock < RuntimeError; end
  end
end
