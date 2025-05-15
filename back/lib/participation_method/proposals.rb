# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def self.method_str
      'proposals'
    end

    def assign_defaults_for_phase
      super
      phase.reacting_dislike_enabled = false
      phase.expire_days_limit ||= 90
      phase.reacting_threshold ||= 300
      phase.prescreening_enabled ||= false
    end

    def budget_in_form?(_)
      false
    end

    def cosponsors_in_form?
      true
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

    def add_autoreaction_to_inputs?
      true
    end

    def default_input_term
      'proposal'
    end

    private

    def proposed_budget_in_form?
      false
    end
  end
end
