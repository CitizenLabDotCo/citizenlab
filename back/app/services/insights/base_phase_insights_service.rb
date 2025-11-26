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
      when 'ideation'
        IdeationPhaseInsightsService
      when 'proposals'
        ProposalsPhaseInsightsService
      else
        raise ArgumentError, "Unhandled phase participation_method: #{phase.participation_method}"
      end

      service_class.new(phase).call
    end

    # --- TEMPLATE METHOD (Instance Method) ---
    # This method defines the immutable workflow for all child services.
    def call
      cached_insights_data

      # Rails.logger.info @participation_method_metrics.inspect
    end

    private

    # TODO: Implement caching? (may not be needed if performance good enough)
    def cached_insights_data
      participations = phase_participations
      participation_method_metrics = phase_participation_method_metrics(participations)
    end

    def participant_id(item_id, user_id, user_hash = nil)
      user_id.presence || user_hash.presence || item_id
    end

    def phase_ideas_counts(participations)
      total_ideas = participations.count
      ideas_last_7_days = participations.count { |p| p[:acted_at] >= 7.days.ago }

      {
        total: total_ideas,
        last_7_days: ideas_last_7_days
      }
    end

    # idea comments posted during the phase
    def phase_comments_counts(participations)
      commenting_participations = participations[:commenting_idea] || []
      total_comments = commenting_participations.count
      comments_last_7_days = commenting_participations.count { |p| p[:acted_at] >= 7.days.ago }

      {
        total: total_comments,
        last_7_days: comments_last_7_days
      }
    end

    def phase_reactions_counts(participations)
      reacting_participations = participations[:reacting_idea] || []
      total_reactions = reacting_participations.count
      reactions_last_7_days = reacting_participations.count { |p| p[:acted_at] >= 7.days.ago }

      {
        total: total_reactions,
        last_7_days: reactions_last_7_days
      }
    end
  end
end
