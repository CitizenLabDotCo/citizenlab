# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_invites
#
#  invited_date   :date
#  inviter_role   :text
#  govocal_staff  :boolean
#  email_sent     :boolean
#  invites_count  :integer
#  accepted_count :integer
#
module Analytics
  module Reporting
    class Invite < Analytics::ApplicationRecordView
      self.table_name = 'reporting_invites'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          Invitations to join the platform, as totals per day invited and
          inviter role: how many people were invited and how many of them
          accepted. There are no rows per person, so it can't tell who was
          invited or who invited them. Acceptances are counted against the day
          of the invitation, so for recent days the acceptance rate can still
          go up. Deleting an account deletes its invitation, so totals can
          shrink over time.
        DOC
      end

      def self.field_descriptions
        {
          'invited_date' => 'Day the invitations were created, in the platform timezone.',
          'inviter_role' => <<~DOC.squish,
            Highest role of the person who sent the invitations, as it is now
            (the platform keeps no role history), like
            reporting_staff_activities.role: 'admin', 'space_moderator',
            'project_folder_moderator', 'project_moderator', or 'former_staff'.
            NULL when no inviter is recorded, for example an account deleted
            since.
          DOC
          'govocal_staff' => <<~DOC.squish,
            TRUE for invitations sent by Go Vocal's own staff, recognised by
            their email address. Filter on govocal_staff = FALSE to report the
            client's own outreach, and say that you did.
          DOC
          'email_sent' => <<~DOC.squish,
            TRUE when the platform emailed the invitation. FALSE when the
            administrator chose not to, for example to share the invitation
            link themselves.
          DOC
          'invites_count' => 'People invited.',
          'accepted_count' => 'Of those invited, how many accepted and joined the platform, at any time since.'
        }
      end

      def self.foreign_keys
        {}
      end
    end
  end
end
