class UpdateAnalyticsFactParticipationsToVersion6 < ActiveRecord::Migration[7.0]
  def change
  
    update_view :analytics_fact_participations, version: 6, revert_to_version: 5
  end
end
