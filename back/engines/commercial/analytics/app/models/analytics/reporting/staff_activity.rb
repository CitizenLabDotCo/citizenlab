# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_staff_activities
#
#  activity_date  :date
#  project_id     :uuid
#  role           :text
#  govocal_staff  :boolean
#  activity       :text
#  activity_count :integer
#
module Analytics
  module Reporting
    class StaffActivity < Analytics::ApplicationRecordView
      self.table_name = 'reporting_staff_activities'
      self.primary_key = nil

      ACTIVITIES = %w[
        project_created project_published project_changed project_deleted
        project_review_requested project_review_approved
        folder_created folder_changed folder_deleted
        phase_created phase_changed phase_deleted
        permissions_changed
        input_status_changed input_assigned
        official_feedback_posted internal_comment_posted
        comment_removed moderation_item_marked_read
      ].freeze

      def self.table_description
        <<~DOC.squish
          How much management work staff (administrators and managers) did:
          one row per day, project, role and activity, with a count. Use it
          to report staff adoption, for example how many statuses managers
          changed in a project per month. It never says which staff member
          did what, and there is no way to get per-person figures: report
          by role, never guess at individuals. Only actions that staff
          alone can take are counted, so totals are a measure of management
          work, not of all staff activity on the platform.
        DOC
      end

      def self.field_descriptions
        {
          'activity_date' => <<~DOC.squish,
            Day the actions happened, in the platform timezone. Group it by
            month or quarter with date_trunc.
          DOC
          'project_id' => <<~DOC.squish,
            The project acted on. NULL for folder activities, deleted projects
            and platform-wide permission changes. Can point to a project that
            was deleted since, so LEFT JOIN reporting_projects.
          DOC
          'role' => <<~DOC.squish,
            Highest role of the person who acted, as it is now (the platform
            keeps no role history): 'admin', 'space_moderator',
            'project_folder_moderator' or 'project_moderator', like
            reporting_users.highest_role. 'former_staff' when the person no
            longer has a role. NULL when no person is recorded: automatic
            actions (such as automatic proposal status changes), actions on
            anonymous inputs, and accounts deleted since. Call NULL "not
            recorded", not "system".
          DOC
          'govocal_staff' => <<~DOC.squish,
            TRUE for actions by Go Vocal's own staff (support and
            onboarding), recognised by their email address. Filter on
            govocal_staff = FALSE to report the client's own adoption, and
            say that you did.
          DOC
          'activity' => <<~DOC.squish,
            What was done. One of: #{ACTIVITIES.map { |activity| "'#{activity}'" }.join(', ')}.
            'project_published' counts publishing a project, also on a
            schedule; 'project_changed', 'folder_changed' and 'phase_changed'
            count any edit, including publishing a folder.
            'input_status_changed' counts changes of an input's status;
            'input_assigned' counts assigning an input to a staff member;
            'comment_removed' counts comments a manager removed with a reason
            (not authors deleting their own); 'moderation_item_marked_read'
            counts items marked as read in the moderation inbox.
          DOC
          'activity_count' => 'Number of actions in this group. SUM it across rows.'
        }
      end

      def self.foreign_keys
        { 'project_id' => 'reporting_projects.id' }
      end
    end
  end
end
