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

    class FailedToLock < RuntimeError; end
  end
end
