# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    SUPPORTED_REACTION_MODES = [].freeze
    delegate :additional_export_columns, :supports_serializing?, :validate_phase, to: :voting_method

    def self.method_str
      'voting'
    end

    def allowed_ideas_orders
      %w[random]
    end

    def assign_defaults_for_phase
      super
      phase.ideas_order ||= 'random'
      phase.vote_term ||= 'vote'
      voting_method.assign_defaults_for_phase
    end

    # Remove after unified status implementation
    def idea_status_method
      'ideation'
    end

    def supported_email_campaigns
      super + %w[voting_basket_submitted voting_basket_not_submitted voting_last_chance voting_phase_started voting_results]
    end

    def supports_submission?
      false
    end

    def supports_vote_term?
      true
    end

    def add_autoreaction_to_inputs?
      supports_submission?
    end

    def voting_method
      Factory.instance.voting_method_for(phase)
    end
  end
end
