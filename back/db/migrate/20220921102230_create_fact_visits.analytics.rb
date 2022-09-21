# frozen_string_literal: true
# This migration comes from analytics (originally 20220920151012)

# Create the whole data model for visitor analytics from Matomo
class CreateFactVisits < ActiveRecord::Migration[6.1]
  def change

    # New dimensions
    create_table :analytics_dimension_channels, id: :uuid do |t|
      t.jsonb :name_multiloc
    end

    create_table :analytics_dimension_locales, id: :uuid do |t|
      t.string :name
    end

    create_view :analytics_dimension_users

    # Main fact table
    create_table :analytics_fact_visits, id: :uuid do |t|

      t.string :visitor_id, null: false

      # Dimension FKs
      t.belongs_to :dimension_user, null: true, type: :uuid, index: { name: 'i_v_user' } # No FK as users is a view
      t.belongs_to :dimension_channel, type: :uuid, foreign_key: { to_table: 'analytics_dimension_channels' }, index: { name: 'i_v_channel' }
      t.belongs_to :dimension_date_first_action, type: :date, foreign_key: { to_table: 'analytics_dimension_dates', primary_key: 'date' }, index: { name: 'i_v_first_action' }
      t.belongs_to :dimension_date_last_action, type: :date, foreign_key: { to_table: 'analytics_dimension_dates', primary_key: 'date' }, index: { name: 'i_v_last_action' }

      # Fact data
      t.integer :duration, null: false
      t.integer :pages_visited, null: false
      t.boolean :returning_visitor, null: false, default: true

      # Metadata to join enable updating from matomo data
      t.integer :matomo_visit_id, null: false, index: { unique: true, name: 'i_v_matomo_visit' }
      t.timestamp :matomo_last_action_time, null: false, index: { name: 'i_v_timestamp' }

    end

    create_table :analytics_join_locale_visits, id: false do |t|
      t.belongs_to :dimension_locale, type: :uuid, foreign_key: { to_table: 'analytics_dimension_locales' }
      t.belongs_to :fact_visit, type: :uuid, foreign_key: { to_table: 'analytics_fact_visits' }
    end

    create_table :analytics_join_project_visits, id: false do |t|
      t.belongs_to :dimension_project, type: :uuid # No FK as projects is a view
      t.belongs_to :fact_visit, type: :uuid, foreign_key: { to_table: 'analytics_fact_visits' }
    end


  end
end
