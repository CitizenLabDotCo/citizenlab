class CreateFactActivitiesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_activities, materialized: true
  end
end
