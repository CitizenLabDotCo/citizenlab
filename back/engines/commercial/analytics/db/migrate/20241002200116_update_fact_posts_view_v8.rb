# frozen_string_literal: true

class UpdateFactPostsViewV8 < ActiveRecord::Migration[7.0]
  def change
    update_view :analytics_fact_posts, version: 8, revert_to_version: 7
  end
end
