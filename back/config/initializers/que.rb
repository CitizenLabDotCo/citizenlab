# frozen_string_literal: true

require 'gem_extensions/que/migrations'
Que::Migrations.singleton_class.prepend GemExtensions::Que::Migrations::ClassMethods

Que::Job.tap do |config|
  config.retry_interval      = proc { |count| (count**6) + 15 + (rand(30) * (count + 1)) }
  config.maximum_retry_count = 9
end


# Rails 7.2 removed `ActiveRecord::Base.clear_active_connections!` but Que 2.3.0 still
# calls it during job cleanup. This shim delegates to the new API so that jobs do not
# appear as failed after their work has already completed successfully.
unless ActiveRecord::Base.respond_to?(:clear_active_connections!)
  ActiveRecord::Base.define_singleton_method(:clear_active_connections!) do
    ActiveRecord::Base.connection_handler.clear_active_connections!
  end
end

# Rails 7.2 introduced transaction-aware job enqueueing, which requires queue adapters
# to implement the `enqueue_after_transaction_commit?` method. The Que gem has not yet
# implemented this method, causing an error.
Rails.application.config.to_prepare do
  if defined?(ActiveJob::QueueAdapters::QueAdapter)
    adapter = ActiveJob::QueueAdapters::QueAdapter
    raise 'This patch can be deleted.' if adapter.instance_methods.include?(:enqueue_after_transaction_commit?)

    adapter.class_eval do
      def enqueue_after_transaction_commit?
        false
      end
    end
  end
end
