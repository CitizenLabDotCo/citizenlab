module ActiveJobQueExtension
  def self.included(base)
    base.class_eval do
      class << self
        # rubocop:disable Style/OptionalBooleanParameter
        def perform_retries(should_retry = true, count: 15)
          define_method(:handle_error) do |_e|
            should_retry && error_count <= count ? retry_in_default_interval : expire
          end
        end
        # rubocop:enable Style/OptionalBooleanParameter
      end
    end
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
