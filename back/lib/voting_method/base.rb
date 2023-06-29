# frozen_string_literal: true

module VotingMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
    end

    def validate
      # Default is to do nothing.
    end

    private

    attr_reader :participation_context
  end
end
