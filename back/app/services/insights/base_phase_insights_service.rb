module Insights
  class BasePhaseInsightsService
    attr_reader :phase

    def initialize(phase)
      @phase = phase
      @participations = {}

      @permissions_custom_fields_service ||= Permissions::PermissionsCustomFieldsService.new
    end

    # --- FACTORY/DISPATCHER METHOD (Class Method) ---
    # This method is the entry point that handles selection and instantiation.
    def self.call(phase)
      service_class = case phase.participation_method
      when 'ideation'
        IdeationPhaseInsightsService
      else
        raise ArgumentError, "Unhandled phase participation_method: #{phase.participation_method}"
      end

      service_class.new(phase).call
    end

    # --- TEMPLATE METHOD (Instance Method) ---
    # This method defines the immutable workflow for all child services.
    def call
      cached_insights_data

      Rails.logger.info @participations.inspect
    end

    private

    # TODO: Implement caching? (may not be needed if performance good enough)
    def cached_insights_data
      participations
    end

    def participant_id(item_id, user_id, user_hash = nil)
      user_id.presence || user_hash.presence || item_id
    end
  end
end
