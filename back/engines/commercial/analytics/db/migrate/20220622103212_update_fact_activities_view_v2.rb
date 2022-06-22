class UpdateFactActivitiesViewV2 < ActiveRecord::Migration[6.1]
  def change
    # TODO: Not working for materialized view - 'NOT a view' error
    update_view :analytics_fact_activities, materialized: true, version: 2, revert_to_version: 1
  end
end
