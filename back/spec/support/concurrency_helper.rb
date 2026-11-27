# frozen_string_literal: true

module ConcurrencyHelper
  # Runs the block in `count` threads that start at the same time, each with
  # its own database connection in the current tenant. The block gets the
  # thread index. Load records inside the block: the other connections only
  # see committed data. Returns the block results in thread order.
  def concurrently(count = 2)
    tenant = Apartment::Tenant.current
    ready = Queue.new
    start = Queue.new
    threads = Array.new(count) do |index|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          Apartment::Tenant.switch(tenant) do
            ready << true
            start.pop
            yield index
          end
        end
      end
    end
    count.times { ready.pop }
    count.times { start << true }
    threads.map(&:value)
  end

  # Holds the advisory lock from another connection while the block runs.
  def holding_lock(lock_name)
    held = Queue.new
    release = Queue.new
    pg_connection = nil
    holder = Thread.new do
      Thread.current.report_on_exception = false
      ActiveRecord::Base.connection_pool.with_connection do |connection|
        pg_connection = connection.raw_connection
        CitizenLab::LockManager.with_transaction_lock(lock_name) do
          held << true
          release.pop
        end
      end
    end
    held.pop(timeout: 5) || raise('The lock holder did not take the lock')
    yield
  ensure
    release&.push(true)
    stop_waiting_holder(holder, pg_connection) unless holder.nil? || holder.join(5)
  end

  private

  # A holder still waiting for the lock never finishes. Cancelling its query
  # (rather than killing the thread) gives its connection back to the pool
  # without a query still running.
  def stop_waiting_holder(holder, pg_connection)
    pg_connection&.cancel
    holder.join(5)
  rescue ActiveRecord::QueryCanceled
    nil
  end
end

RSpec.configure do |config|
  config.include ConcurrencyHelper
end
