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
end

RSpec.configure do |config|
  config.include ConcurrencyHelper
end
