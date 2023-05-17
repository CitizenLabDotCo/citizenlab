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

  # Removing the freeze step from
  # https://github.com/que-rb/que/blob/531b7916a1267b20c71cd0dbfe7e70853642418e/lib/que/active_job/extensions.rb#L15-L34
  def perform(*args)
    args, kwargs = Que.split_out_ruby2_keywords(args)

    Que.internal_log(:active_job_perform, self) do
      { args: args, kwargs: kwargs }
    end

    _run(
      args: que_filter_args(
        args.map { |a| a.is_a?(Hash) ? a.deep_symbolize_keys : a }
      ),
      kwargs: que_filter_args(kwargs.deep_symbolize_keys),
    )
  end
end
