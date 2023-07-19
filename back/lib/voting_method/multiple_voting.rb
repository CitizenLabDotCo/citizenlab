# frozen_string_literal: true

module VotingMethod
  class MultipleVoting < Base
    def validate_participation_context
      if participation_context.voting_max_total.blank?
        participation_context.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end
    end

    def export_columns
      %w[participants votes]
    end
  end
end
