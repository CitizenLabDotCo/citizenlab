# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    SUPPORTED_REACTION_MODES = [].freeze
    delegate :additional_export_columns, :supports_serializing?, to: :voting_method

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

    def validate_phase
      super
      voting_method.validate_phase
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

    def participations
      # events? Not associated with phase, so cannot really be seen as participation in voting phase.
      {
        voting: participation_baskets,
        commenting_idea: participation_idea_comments
      }
    end

    def participation_baskets
      phase.baskets.includes(:user, :baskets_ideas).map do |basket|
        total_votes = basket.baskets_ideas.sum(:votes)

        {
          id: basket.id,
          action: 'voting',
          acted_at: basket.submitted_at,
          classname: 'Basket',
          user_id: basket.user_id,
          user_custom_field_values: basket.user.custom_field_values,
          votes: total_votes
        }
      end
    end
  end
end
