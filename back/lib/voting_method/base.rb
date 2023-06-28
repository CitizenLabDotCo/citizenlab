# frozen_string_literal: true

module VotingMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
    end

    def validate_participation_context
      # Default is to do nothing.
    end

    def validate_baskets_idea
      # Default is to do nothing.
    end

    def budget_in_form?(_user)
      false
    end

    private

    attr_reader :participation_context
  end
end
