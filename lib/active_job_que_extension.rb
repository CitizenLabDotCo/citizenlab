module ActiveJobQueExtension
  DEFAULT_MAX_RETRIES = 15

  # rubocop:disable Metrics/MethodLength
  def self.included(base)
    # rubocop:enable Metrics/MethodLength

    base.class_eval do
      delegate :should_retry, :max_retries, to: :class
      class << self
        attr_reader :should_retry

        # rubocop:disable Style/OptionalBooleanParameter
        def perform_retries(should_retry = true, max: DEFAULT_MAX_RETRIES)
          @should_retry = should_retry
          @max_retries = max
        end
        # rubocop:enable Style/OptionalBooleanParameter

        def max_retries
          @max_retries || DEFAULT_MAX_RETRIES
        end
      end
    end
  end

  def handle_error(error)
    return unless should_retry && error_count < max_retries

    super
  end

  # Removing the freeze step from
  # https://github.com/que-rb/que/blob/77c6b92952b821898c393239ce0e4047b17d7dae/lib/que/active_job/extensions.rb#L14
  def perform(*args)
    Que.internal_log(:active_job_perform, self) { { args: args } }

    _run(
      args: que_filter_args(
        args.map { |a| a.is_a?(Hash) ? a.deep_symbolize_keys : a }
      )
    )
  end
end
