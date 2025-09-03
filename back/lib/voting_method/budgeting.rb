# frozen_string_literal: true

module VotingMethod
  class Budgeting < Base
    def assign_defaults_for_phase
      phase.voting_max_votes_per_idea = nil
    end

    def validate_phase
      assign_defaults_for_phase if !phase.voting_max_votes_per_idea.nil?

      if phase.voting_max_total.blank?
        phase.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end

      if phase.voting_min_total.blank?
        phase.errors.add :voting_min_total, :blank, message: 'voting min total is blank'
      end
    end

    def validate_baskets_idea(baskets_idea)
      if baskets_idea.idea.budget.blank?
        baskets_idea.errors.add :idea, :has_no_budget, message: 'does not have a specified budget'
      end
    end

    def budget_in_form?(user)
      !!user && UserRoleService.new.can_moderate_project?(phase.project, user)
    end

    def assign_baskets_idea(baskets_idea)
      baskets_idea.votes = baskets_idea.idea.budget
    end

    def update_before_submission_change!(basket)
      basket.baskets_ideas.each do |baskets_idea|
        baskets_idea.update!(votes: baskets_idea.idea.budget)
      end
    end

    def votes_for_idea(idea)
      idea.ideas_phases.find { |ideas_phase| ideas_phase.phase_id == phase.id }&.baskets_count || 0
    end

    def additional_export_columns
      super + %w[picks budget]
    end

    def supports_serializing?(attribute)
      return false if %i[total_votes_amount].include?(attribute)

      super
    end
  end
end
