# frozen_string_literal: true

class CreateFactPostsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_posts
  end
end
