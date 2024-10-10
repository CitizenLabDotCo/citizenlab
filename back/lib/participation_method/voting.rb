# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    def self.method_str
      'voting'
    end

    def additional_export_columns
      Factory.instance.voting_method_for(phase).export_columns
    end

    def allowed_ideas_orders
      %w[random]
    end

    def assign_defaults_for_phase
      phase.ideas_order ||= 'random'
      phase.input_term ||= default_input_term if supports_input_term?
      Factory.instance.voting_method_for(phase).assign_defaults_for_phase
    end

    # Remove after unified status implementation
    def idea_status_method
      'ideation'
    end

    def supports_reacting?
      false
    end

    def supports_serializing?(attribute)
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        voting_term_singular_multiloc voting_term_plural_multiloc votes_count
      ].include?(attribute)
    end

    def supports_submission?
      false
    end
  end
end
