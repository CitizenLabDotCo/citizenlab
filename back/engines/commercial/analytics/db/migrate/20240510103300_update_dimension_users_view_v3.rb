# frozen_string_literal: true

class UpdateDimensionUsersViewV3 < ActiveRecord::Migration[7.0]
  def change
    update_view :analytics_dimension_users, version: 3, revert_to_version: 2
  end
end
