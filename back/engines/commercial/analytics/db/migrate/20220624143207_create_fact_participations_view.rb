# frozen_string_literal: true

class CreateFactParticipationsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_participations, materialized: true

    add_index :analytics_fact_participations, :id
    add_index :analytics_fact_participations, :project_id
    add_index :analytics_fact_participations, :created_date_id
  end
end
