# frozen_string_literal: true

module VotingMethod
  class SingleVoting < Voting
    def initialize(participation_context)
      participation_context.voting_max_votes_per_idea = 1
      super
    end
  end
end
