# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_participants
#
#  id         :text             primary key
#  user_id    :uuid
#  created_at :datetime
#  anonymous  :boolean
#
module Analytics
  module Reporting
    class Participant < Analytics::ApplicationRecordView
      self.table_name = 'reporting_participants'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per participant: the (best-effort) human being behind one or
          more rows in reporting_contributions. Anonymous contributions without
          a stable author hash each count as their own participant, which can
          overcount people. All timestamps are in UTC.
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Participant identity. Equals reporting_contributions.participant_id.',
          'user_id' => 'The registered user behind this participant, or NULL when anonymous. Joins to reporting_users.id.',
          'created_at' => 'When this participant first participated (earliest contributed_at).',
          'anonymous' => 'TRUE when the participant cannot be tied to a registered user account.'
        }
      end
    end
  end
end
