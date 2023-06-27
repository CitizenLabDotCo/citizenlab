# frozen_string_literal: true

module VotingMethod
  class Budgeting < Base
    def validate_participation_context
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
  end
end
