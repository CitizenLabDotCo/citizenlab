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
end
