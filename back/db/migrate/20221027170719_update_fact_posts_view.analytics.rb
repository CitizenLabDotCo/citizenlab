# frozen_string_literal: true

# This migration comes from analytics (originally 20221027180337)

class UpdateFactPostsView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_posts, version: 2, revert_to_version: 1
  end
end
