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
  # https://github.com/que-rb/que/blob/77c6b92952b821898c393239ce0e4047b17d7dae/lib/que/active_job/extensions.rb#L14
  def perform(*args)
    Que.internal_log(:active_job_perform, self) { { args: args } }

    _run(
      args: que_filter_args(
        args.map { |a| a.is_a?(Hash) ? a.deep_symbolize_keys : a }
      ),
      reraise_errors: true
    )
  end
end
