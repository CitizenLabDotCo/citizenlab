# frozen_string_literal: true

module VotingMethod
  class SingleVoting < Base
    def validate
      if participation_context.voting_max_votes_per_idea != 1
        participation_context.errors.add :voting_max_votes_per_idea, :invalid, message: 'voting_max_votes_per_idea must be 1'
      end
      super
    end
  end
end
