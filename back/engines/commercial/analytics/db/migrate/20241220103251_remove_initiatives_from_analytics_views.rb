class RemoveInitiativesFromAnalyticsViews < ActiveRecord::Migration[7.0]
  def change
    # We need to drop analytics_fact_posts, before updating analytics_build_feedbacks
    # because analytics_fact_posts depends on analytics_build_feedbacks.
    drop_view :analytics_fact_posts, revert_to_version: 8
    update_view :analytics_build_feedbacks, version: 2, revert_to_version: 1
    # We recreate analytics_fact_posts, after updating analytics_build_feedbacks
    create_view :analytics_fact_posts, version: 8
    update_view :analytics_dimension_statuses, version: 3, revert_to_version: 2
    update_view :analytics_fact_participations, version: 8, revert_to_version: 7
    update_view :analytics_fact_posts, version: 9, revert_to_version: 8
  end
end
