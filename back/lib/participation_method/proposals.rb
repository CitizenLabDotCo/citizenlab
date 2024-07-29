# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def transitive?
      false
    end

    def assign_defaults_for_phase
      super
      phase.expire_days_limit ||= 90
      phase.reacting_threshold ||= 300
    end

    # def assign_defaults(_)
    #   super # TODO: default status and publication status
    # end

    def budget_in_form?(_)
      false
    end

    def proposed_budget_in_form?
      false
    end

    # def update_if_published?
    #   super # TODO: if no reviewing and no reactions + toggle
    # end

    # def supports_status?
    #   super # TODO: separate proposal statuses
    # end

    def supports_serializing?(attribute)
      %i[expire_days_limit reacting_threshold].include?(attribute)
    end

    def supports_serializing_input?(attribute)
      %i[expires_at reactions_needed].include?(attribute)
    end
  end
end
