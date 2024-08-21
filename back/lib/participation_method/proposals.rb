# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def self.method_str
      'proposals'
    end

    def assign_defaults(input)
      if input.creation_phase.reviewing_enabled
        input.idea_status ||= IdeaStatus.find_by!(code: 'prescreening', participation_method: idea_status_method)
      end
      super
    end

    def assign_defaults_for_phase
      super
      phase.reacting_dislike_enabled = false
      phase.expire_days_limit ||= 90
      phase.reacting_threshold ||= 300
    end

    def budget_in_form?(_)
      false
    end

    def supports_automated_statuses?
      true
    end

    def supports_serializing?(attribute)
      %i[expire_days_limit reacting_threshold].include?(attribute)
    end

    def supports_serializing_input?(attribute)
      %i[expires_at reacting_threshold].include?(attribute)
    end

    def transitive?
      false
    end

    def use_reactions_as_votes?
      true
    end

    private

    def proposed_budget_in_form?
      false
    end
  end
end
