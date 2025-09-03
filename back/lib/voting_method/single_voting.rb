# frozen_string_literal: true

module VotingMethod
  class SingleVoting < Base
    def assign_defaults_for_phase
      phase.voting_max_votes_per_idea = 1
    end

    def validate_phase
      if phase.voting_max_votes_per_idea != 1
        phase.errors.add :voting_max_votes_per_idea, :invalid, message: 'voting_max_votes_per_idea must be 1'
      end
    end

    def additional_export_columns
      super + %w[votes]
    end
  end
end
