# frozen_string_literal: true

class UpdateDimensionUsersViewV4 < ActiveRecord::Migration[7.2]
  def change
    update_view :analytics_dimension_users, version: 4, revert_to_version: 3
  end
end
