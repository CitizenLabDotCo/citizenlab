class CreateFactActivitiesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_activities, materialized: true

    add_index :analytics_fact_activities, :id
    add_index :analytics_fact_activities, :project_id
    add_index :analytics_fact_activities, :created_date_id

  end
end
