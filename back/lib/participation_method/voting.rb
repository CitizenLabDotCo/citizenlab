# frozen_string_literal: true

module ParticipationMethod
  class Voting < Ideation
    def assign_defaults_for_participation_context
      participation_context.ideas_order ||= 'random'
      participation_context.voting_max_votes_per_idea = 1 if participation_context.voting_method == 'single_voting'
    end

    def budget_in_form?(user)
      if participation_context.project.continuous? \
      && Factory.instance.voting_method_for(participation_context).budget_in_form?(user)
        return true
      end

      super
    end

    def allowed_ideas_orders
      %w[random]
    end

    def posting_allowed?
      false
    end

    def supports_reacting?
      false
    end

    def sign_in_required_for_posting?
      true
    end
  end
end
