# frozen_string_literal: true

# This migration comes from analytics (originally 20261005100000)

class UpdateDimensionUsersViewV4 < ActiveRecord::Migration[7.2]
  def change
    update_view :analytics_dimension_users, version: 4, revert_to_version: 3
  end
end
