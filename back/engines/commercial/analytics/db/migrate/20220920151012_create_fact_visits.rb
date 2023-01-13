# frozen_string_literal: true

# Create the whole data model for visitor analytics from Matomo
class CreateFactVisits < ActiveRecord::Migration[6.1]
  def change
    # Dimensions
    create_table :analytics_dimension_referrer_types, id: :uuid do |t|
      t.string :key, null: false, index: { unique: true, name: 'i_d_referrer_key' }
      t.string :name, null: false
    end

    create_table :analytics_dimension_locales, id: :uuid do |t|
      t.string :name, null: false, index: { unique: true }
    end

    create_view :analytics_dimension_users

    # Main fact table
    create_table :analytics_fact_visits, id: :uuid do |t|
      t.string :visitor_id, null: false

      # Dimension FKs
      t.belongs_to :dimension_user, null: true, type: :uuid, index: { name: 'i_v_user' } # No FK as users is a view
      t.belongs_to :dimension_referrer_type, null: false, type: :uuid, foreign_key: { to_table: 'analytics_dimension_referrer_types' }, index: { name: 'i_v_referrer_type' }
      t.belongs_to :dimension_date_first_action, null: false, type: :date, foreign_key: { to_table: 'analytics_dimension_dates', primary_key: 'date' }, index: { name: 'i_v_first_action' }
      t.belongs_to :dimension_date_last_action, null: false, type: :date, foreign_key: { to_table: 'analytics_dimension_dates', primary_key: 'date' }, index: { name: 'i_v_last_action' }

      # Fact data
      t.integer :duration, null: false
      t.integer :pages_visited, null: false
      t.boolean :returning_visitor, null: false, default: false
      t.string :referrer_name
      t.string :referrer_url

      # Metadata to join enable updating from matomo data
      t.integer :matomo_visit_id, null: false, index: { unique: true, name: 'i_v_matomo_visit' }
      t.timestamp :matomo_last_action_time, null: false, index: { name: 'i_v_timestamp' }
    end

    # Join tables
    create_table :analytics_dimension_locales_fact_visits, id: false do |t|
      t.belongs_to :dimension_locale, type: :uuid, foreign_key: { to_table: 'analytics_dimension_locales' }, index: { name: 'i_l_v_locale' }
      t.belongs_to :fact_visit, type: :uuid, foreign_key: { to_table: 'analytics_fact_visits' }, index: { name: 'i_l_v_visit' }
    end

    create_table :analytics_dimension_projects_fact_visits, id: false do |t|
      t.belongs_to :dimension_project, type: :uuid, index: { name: 'i_p_v_project' } # No FK as projects is a view
      t.belongs_to :fact_visit, type: :uuid, foreign_key: { to_table: 'analytics_fact_visits' }, index: { name: 'i_p_v_visit' }
    end
  end
end
