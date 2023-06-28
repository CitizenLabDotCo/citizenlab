# frozen_string_literal: true

module VotingMethod
  class Budgeting < Base
    def validate
      super
      if participation_context.voting_min_total.blank?
        participation_context.errors.add :voting_min_total, :blank, message: 'voting min total is blank'
      end
    end
  end
end
