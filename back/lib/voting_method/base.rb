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

    def export_columns
      []
    end

    private

    attr_reader :phase
  end
end
