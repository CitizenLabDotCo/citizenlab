# frozen_string_literal: true

# This migration comes from analytics (originally 20221027135433)

class UpdateDimensionUsersView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_dimension_users, version: 2, revert_to_version: 1
  end
end
