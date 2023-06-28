# frozen_string_literal: true

module VotingMethod
  class Base
    def initialize(participation_context)
      @participation_context = participation_context
    end

    def validate
      if participation_context.voting_max_total.blank?
        participation_context.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end
    end

    private

    attr_reader :participation_context
  end
end
