# frozen_string_literal: true
# This migration comes from analytics (originally 20220905151012)

# Create the whole data model for visitor analytics from Matomo
class CreateFactVisits < ActiveRecord::Migration[6.1]
  def change
    create_table :analytics_fact_visits, id: :uuid do |t|

      t.string :visitor_id, null: false

      # Dimension FKs
      t.uuid :user_id, null: true
      t.uuid :channel_id # analytics_dimension_channels
      t.date :first_action_date_id # analytics_dimension_dates
      t.date :last_action_date_id # analytics_dimension_dates

      # Fact data
      t.integer :duration
      t.integer :pages_visited
      t.boolean :returning_visitor, null: false, default: true

      # Metadata to join enable updating from matomo data
      t.string :matomo_visit_id, null: false
      t.integer :last_action_timestamp, null: false

    end

    create_table :analytics_dimension_channels, id: :uuid do |t|
      t.jsonb :name_multiloc
    end

    create_table :analytics_dimension_locales, id: :uuid do |t|
      t.string :name
    end

    create_table :analytics_join_locale_visits, id: false, primary_key: [:dimension_locale_id, :fact_visit_id] do |t|
      t.uuid :dimension_locale_id, index: true, foreign_key: true
      t.uuid :fact_visit_id, index: true, foreign_key: true
    end

    create_table :analytics_join_project_visits, id: false, primary_key: [:dimension_project_id, :fact_visit_id] do |t|
      t.uuid :dimension_project_id, index: true, foreign_key: true
      t.uuid :fact_visit_id, index: true, foreign_key: true
    end

  end
end
