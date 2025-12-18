# frozen_string_literal: true

module VotingMethod
  class Base
    def initialize(phase)
      @phase = phase
    end

    def assign_defaults_for_phase
      # Default is to do nothing.
    end

    def validate_phase
      # Default is to do nothing.
    end

    def validate_baskets_idea(_baskets_idea)
      # Default is to do nothing.
    end

    def budget_in_form?(_user)
      false
    end

    def assign_baskets_idea(_baskets_idea)
      # Default is to do nothing.
    end

    def update_before_submission_change!(_basket)
      # Default is to do nothing.
    end

    def votes_for_idea(idea)
      idea.ideas_phases.find { |ideas_phase| ideas_phase.phase_id == phase&.id }&.votes_count || 0
    end

    def additional_export_columns
      %w[manual_votes]
    end

    def supports_serializing?(attribute)
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea baskets_count
        votes_count total_votes_amount autoshare_results_enabled voting_min_selected_options voting_filtering_enabled
      ].include?(attribute)
    end

    private

    attr_reader :phase
  end
end
