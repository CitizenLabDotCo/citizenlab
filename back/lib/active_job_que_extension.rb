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

  # Removing the freeze steps from
  # https://github.com/que-rb/que/blob/3d452f22688558e87f71d079029d75eb09bf2203/lib/que/active_job/extensions.rb#L14
  #
  # Addendum: It's unclear why the freeze steps were removed when originally patching
  # Que for multi-tenancy support. However, when upgrading to Que 2.0.0, we simply
  # transposed the same logic to the new implementation of the +perform+ method.
  # Ideally, we should investigate why the freeze steps were initially removed and
  # determine if there is a less invasive way to support multi-tenancy.
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
      reraise_errors: true
    )
  end
end
