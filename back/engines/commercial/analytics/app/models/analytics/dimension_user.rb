# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_dimension_users
#
#  id(User primary key. Target of fact dimension_user_id foreign keys.)                                                                                                                                         :uuid             primary key
#  role(Highest role of the user, taken from the first entry of their roles. One of admin, project_moderator, project_folder_moderator or space_moderator, or citizen for ordinary users with no special role.) :text
#  invite_status(Invitation state: pending (invited, not yet accepted), accepted, or NULL when the user registered directly rather than by invitation.)                                                         :string
#  has_visits(True when the user has at least one recorded visit. Visits here come from the Matomo-based visits fact, which can differ from the visitor numbers shown on dashboards (a different source).)      :boolean
#
module Analytics
  class DimensionUser < Analytics::ApplicationRecordView
    self.primary_key = :id
  end
end
