# frozen_string_literal: true

# This migration comes from analytics (originally 20220624103212)

class CreateFactPostsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_posts
  end
end
