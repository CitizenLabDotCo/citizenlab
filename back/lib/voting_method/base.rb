# frozen_string_literal: true

module VotingMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
    end

    def assign_defaults_for_participation_context
      # Default is to do nothing.
    end

    def validate_participation_context
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

    attr_reader :participation_context
  end
end
