# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_votes
#
#  id       :uuid             primary key
#  input_id :uuid
#  user_id  :uuid
#  voted_at :datetime
#  weight   :integer
#
module Analytics
  module Reporting
    class InputVote < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_votes'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per vote a user cast on an input during a voting or
          participatory-budgeting phase, from submitted ballots only. Offline
          votes are not included here; they only exist as a total in
          reporting_inputs.offline_votes_count.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The input the vote is for.',
          'user_id' => 'The voter, or NULL for deleted users.',
          'voted_at' => 'When the voter submitted their ballot (UTC).',
          'weight' => <<~DOC.squish
            Magnitude of the vote: 1 for single voting, the number of votes put
            on this input for multiple voting, and the allocated amount for
            participatory budgeting. SUM(weight) gives an input's online vote
            total.
          DOC
        }
      end

      def self.foreign_keys
        { 'input_id' => 'reporting_inputs.id', 'user_id' => 'reporting_users.id' }
      end
    end
  end
end
