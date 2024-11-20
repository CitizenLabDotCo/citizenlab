# frozen_string_literal: true

# This migration comes from analytics (originally 20241001111534)
class UpdateFactPostsViewV7 < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_posts, version: 7, revert_to_version: 6
  end
end
