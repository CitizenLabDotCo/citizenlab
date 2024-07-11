# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    def assign_defaults_for_phase
      phase.ideas_order ||= 'random'
      Factory.instance.voting_method_for(phase).assign_defaults_for_phase
    end

    def allowed_ideas_orders
      %w[random]
    end

    def supports_posting_inputs?
      false
    end

    def supports_reacting?
      false
    end

    def sign_in_required_for_posting?
      true
    end

    def additional_export_columns
      Factory.instance.voting_method_for(phase).export_columns
    end
  end
end
