# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    SUPPORTED_REACTION_MODES = [].freeze
    delegate :additional_export_columns, :supports_serializing?, :validate_phase, to: :voting_method

    def self.method_str
      'voting'
    end

    def phase_insights_class
      Insights::VotingPhaseInsightsService
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

    # Participants don't post inputs in voting phases, so the
    # allow_multiple_responses setting inherited from Ideation does not apply.
    def allow_posting_again_after
      0.seconds
    end

    def supports_multiple_responses_setting?
      false
    end

    # Voting reuses ideation inputs but has no admin-fillable response form to
    # export (overrides the `true` inherited from Ideation).
    def supports_input_pdf_export?
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

    def supports_inputs_without_author?
      false
    end

    def supports_permitted_by_everyone?
      false
    end
  end
end
