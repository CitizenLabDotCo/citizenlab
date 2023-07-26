# frozen_string_literal: true

module VotingMethod
  class SingleVoting < Base
    def assign_defaults_for_participation_context
      participation_context.voting_max_votes_per_idea = 1
    end

    def validate_participation_context
      if participation_context.voting_max_votes_per_idea != 1
        participation_context.errors.add :voting_max_votes_per_idea, :invalid, message: 'voting_max_votes_per_idea must be 1'
      end
    end

    def export_columns
      %w[votes]
    end
  end
end
