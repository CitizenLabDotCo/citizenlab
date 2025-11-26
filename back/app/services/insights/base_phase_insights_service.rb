module Insights
  class BasePhaseInsightsService
    attr_reader :phase

    def initialize(phase)
      @phase = phase

      @permissions_custom_fields_service ||= Permissions::PermissionsCustomFieldsService.new
    end

    # --- FACTORY/DISPATCHER METHOD (Class Method) ---
    # This method is the entry point that handles selection and instantiation.
    def self.call(phase)
      service_class = case phase.participation_method
        when 'ideation' then IdeationPhaseInsightsService
        else raise ArgumentError, "Unhandled phase participation_method: #{phase.participation_method}"
      end

      service_class.new(phase).call
    end

    # --- TEMPLATE METHOD (Instance Method) ---
    # This method defines the immutable workflow for all child services.
    def call
      test
    end

    private

    def test
      Rails.logger.info 'BasePhaseInsightsService'
    end
  end
end
