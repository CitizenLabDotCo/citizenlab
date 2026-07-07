# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_reactions
#
#  id         :uuid             primary key
#  input_id   :uuid
#  user_id    :uuid
#  reacted_at :datetime
#  mode       :string
#
module Analytics
  module Reporting
    class InputReaction < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_reactions'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per reaction (like or dislike) on an input. Authors like
          their own input by default when posting it. Reactions on comments are
          not included here; they only appear in reporting_contributions. All
          timestamps are in UTC.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Reaction primary key.',
          'input_id' => 'The input reacted to. Joins to reporting_inputs.id.',
          'user_id' => 'The reacting user, or NULL for anonymous or deleted users. Joins to reporting_users.id.',
          'reacted_at' => 'When the reaction was placed.',
          'mode' => "'up' for a like, 'down' for a dislike."
        }
      end
    end
  end
end
