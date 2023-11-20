# frozen_string_literal: true

# This migration comes from analytics (originally 20230213120148)

class UpdateFactPostsViewV3 < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_posts, version: 3, revert_to_version: 2
  end
end
