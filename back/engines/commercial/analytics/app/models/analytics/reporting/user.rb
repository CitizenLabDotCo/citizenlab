# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_users
#
#  id            :uuid             primary key
#  registered_at :datetime
#  created_at    :datetime
#  highest_role  :text
#
module Analytics
  module Reporting
    class User < Analytics::ApplicationRecordView
      self.table_name = 'reporting_users'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per active registered user. Pending invitations, incomplete
          registrations and currently blocked accounts are excluded. The view
          carries no names or email addresses by design; demographics live in
          reporting_user_question_answers. Note that a user is not necessarily
          a participant (see reporting_participants).
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'registered_at' => 'When the user completed registration (UTC). Count registrations by this date.',
          'created_at' => 'When the account was first created (UTC), possibly before completing registration.',
          'highest_role' => <<~DOC.squish
            Highest platform role: 'admin', 'space_moderator',
            'project_folder_moderator', 'project_moderator' or 'user'
            (a regular resident). Filter to 'user' to exclude platform staff
            from counts.
          DOC
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
