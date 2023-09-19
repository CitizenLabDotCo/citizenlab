# frozen_string_literal: true

module VotingMethod
  class Budgeting < Base
    def assign_defaults_for_participation_context
      participation_context.voting_max_votes_per_idea = nil
    end

    def validate_participation_context
      assign_defaults_for_participation_context if !participation_context.voting_max_votes_per_idea.nil?

      if participation_context.voting_max_total.blank?
        participation_context.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end

      if participation_context.voting_min_total.blank?
        participation_context.errors.add :voting_min_total, :blank, message: 'voting min total is blank'
      end
    end

    def validate_baskets_idea(baskets_idea)
      if baskets_idea.idea.budget.blank?
        baskets_idea.errors.add :idea, :has_no_budget, message: 'does not have a specified budget'
      end
    end

    def budget_in_form?(user)
      !!user && UserRoleService.new.can_moderate_project?(participation_context.project, user)
    end

    def assign_baskets_idea(baskets_idea)
      baskets_idea.votes = baskets_idea.idea.budget
    end

    def update_before_submission_change!(basket)
      basket.baskets_ideas.each do |baskets_idea|
        baskets_idea.update!(votes: baskets_idea.idea.budget)
      end
    end

    def export_columns
      %w[picks budget]
    end
  end
end
