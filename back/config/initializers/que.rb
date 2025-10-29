# frozen_string_literal: true

require 'gem_extensions/que/migrations'
Que::Migrations.singleton_class.prepend GemExtensions::Que::Migrations::ClassMethods

Que::Job.tap do |config|
  config.retry_interval      = proc { |count| (count**6) + 15 + (rand(30) * (count + 1)) }
  config.maximum_retry_count = 9
end

# Latest version of Que didn't add this method yet.
Rails.application.config.to_prepare do
  if defined?(ActiveJob::QueueAdapters::QueAdapter)
    ActiveJob::QueueAdapters::QueAdapter.class_eval do
      def enqueue_after_transaction_commit?
        false
      end
    end
  end
end
