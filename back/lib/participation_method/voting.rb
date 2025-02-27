# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    delegate :additional_export_columns, :supports_serializing?, to: :voting_method

    def self.method_str
      'voting'
    end

    def allowed_ideas_orders
      %w[random]
    end

    def assign_defaults_for_phase
      phase.ideas_order ||= 'random'
      phase.input_term ||= default_input_term if supports_input_term?
      voting_method.assign_defaults_for_phase
    end

    # Remove after unified status implementation
    def idea_status_method
      'ideation'
    end

    def supports_reacting?
      false
    end

    def supports_submission?
      false
    end

    def voting_method
      Factory.instance.voting_method_for(phase)
    end
  end
end
