# frozen_string_literal: true

class DropAnalyticsViews < ActiveRecord::Migration[7.1]
  def up
    # Drop fact_posts first as it depends on build_feedbacks
    execute 'DROP VIEW IF EXISTS analytics_fact_posts'
    execute 'DROP VIEW IF EXISTS analytics_build_feedbacks'

    # Drop remaining views (no interdependencies)
    execute 'DROP VIEW IF EXISTS analytics_fact_participations'
    execute 'DROP VIEW IF EXISTS analytics_fact_project_statuses'
    execute 'DROP VIEW IF EXISTS analytics_fact_registrations'
    execute 'DROP VIEW IF EXISTS analytics_fact_events'
    execute 'DROP VIEW IF EXISTS analytics_fact_email_deliveries'
    execute 'DROP VIEW IF EXISTS analytics_fact_sessions'
    execute 'DROP VIEW IF EXISTS analytics_dimension_users'
    execute 'DROP VIEW IF EXISTS analytics_dimension_projects'
    execute 'DROP VIEW IF EXISTS analytics_dimension_statuses'
  end

  def down
    # Views are now implemented as inline queries in ActiveRecord models.
    # To revert, re-create views from the SQL files in version control history.
    raise ActiveRecord::IrreversibleMigration
  end
end
