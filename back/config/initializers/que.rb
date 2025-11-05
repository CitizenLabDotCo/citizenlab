# frozen_string_literal: true

require 'gem_extensions/que/migrations'
Que::Migrations.singleton_class.prepend GemExtensions::Que::Migrations::ClassMethods

Que::Job.tap do |config|
  config.retry_interval      = proc { |count| (count**6) + 15 + (rand(30) * (count + 1)) }
  config.maximum_retry_count = 9
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
