# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_users
#
#  id            :uuid             primary key
#  role          :text
#  invite_status :string
#
module Analytics
  class DimensionUser < Analytics::ApplicationRecordView
    self.primary_key = :id

    def self.table_description
      <<~DOC.squish
        User dimension with classification attributes, one row per user. Referenced by facts via
        dimension_user_id.
      DOC
    end

    def self.field_descriptions
      {
        'id' => 'User primary key. Target of fact dimension_user_id foreign keys.',
        'role' => <<~DOC.squish,
          The type of the FIRST role in the user's list of roles, which is NOT necessarily
          their highest role (e.g. a user who was a project_moderator before becoming an admin
          has role project_moderator). One of admin, project_moderator, project_folder_moderator
          or space_moderator, or citizen for ordinary users with no role at all. Reliable for
          telling citizens apart from users with any role, not for telling roles apart.
        DOC
        'invite_status' => <<~DOC.squish
          Invitation state: pending (invited, not yet accepted), accepted, or NULL when the user
          registered directly rather than by invitation.
        DOC
      }
    end
  end
end
