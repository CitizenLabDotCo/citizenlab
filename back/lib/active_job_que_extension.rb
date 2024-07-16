# frozen_string_literal: true

module ActiveJobQueExtension
  def self.included(base)
    base.class_eval do
      class_attribute :should_retry

      class << self
        # rubocop:disable Style/OptionalBooleanParameter
        def perform_retries(should_retry = true)
          self.should_retry = should_retry
        end
        # rubocop:enable Style/OptionalBooleanParameter
      end
    end
  end

  def handle_error(error)
    self.class.should_retry ? super : expire
  end

  def destroy_in(delay)
    finish
    DeleteQueJobJob.set(wait: delay).perform_later(job_id)
  end

  # For some reason, `Que` freezes the arguments and keyword arguments when the job
  # loaded from the DB. We don't want that (the code base as it is today modify those
  # arguments in place in many places), so we override the `Que::ActiveJob::JobExtensions#perform`
  # method to skip the freezing step.
  def perform(*args)
    args, kwargs = Que.split_out_ruby2_keywords(args)

    Que.internal_log(:active_job_perform, self) do
      { args: args, kwargs: kwargs }
    end

    _run(
      args: que_filter_args(args.map { |a| a.is_a?(Hash) ? a.deep_symbolize_keys : a }),
      kwargs: que_filter_args(kwargs.deep_symbolize_keys),
      reraise_errors: true
    )
  end
  ruby2_keywords(:perform) if respond_to?(:ruby2_keywords, true)
end
