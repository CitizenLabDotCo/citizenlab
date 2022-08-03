# frozen_string_literal: true

class CreateFactPostsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_posts, materialized: true

    add_index :analytics_fact_posts, :id
    add_index :analytics_fact_posts, :project_id
    add_index :analytics_fact_posts, :created_date_id
  end
end
