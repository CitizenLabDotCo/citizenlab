# frozen_string_literal: true

module VotingMethod
  class MultipleVoting < Base
    def validate_phase
      if phase.voting_max_total.blank?
        phase.errors.add :voting_max_total, :blank, message: 'voting max total is blank'
      end
    end

    def additional_export_columns
      super + %w[participants votes]
    end
  end
end
