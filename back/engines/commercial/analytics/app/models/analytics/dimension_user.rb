# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_users
#
#  id            :uuid             primary key
#  role          :text
#  invite_status :string
#  has_visits    :boolean
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
          Highest role of the user, taken from the first entry of their roles. One of admin,
          project_moderator, project_folder_moderator or space_moderator, or citizen for ordinary
          users with no special role.
        DOC
        'invite_status' => <<~DOC.squish,
          Invitation state: pending (invited, not yet accepted), accepted, or NULL when the user
          registered directly rather than by invitation.
        DOC
        'has_visits' => <<~DOC.squish
          True when the user has at least one recorded visit. Visits here come from the Matomo-based
          visits fact, which can differ from the visitor numbers shown on dashboards (a different source).
        DOC
      }
    end
  end
end
