# frozen_string_literal: true

class ConvertToNormalViews < ActiveRecord::Migration[6.1]
  def change
    # Drop the materialized views
    drop_view :analytics_fact_posts, materialized: true
    drop_view :analytics_fact_participations, materialized: true
    drop_view :analytics_build_feedbacks, materialized: true
    drop_view :analytics_dimension_projects, materialized: true

    # Recreate as normal views
    create_view :analytics_dimension_projects, version: 1
    create_view :analytics_build_feedbacks, version: 1
    create_view :analytics_fact_posts, version: 2
    create_view :analytics_fact_participations, version: 2
  end
end
