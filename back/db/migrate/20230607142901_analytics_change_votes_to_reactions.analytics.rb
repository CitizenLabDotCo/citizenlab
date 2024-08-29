# frozen_string_literal: true

# This migration comes from analytics (originally 20230607151713)

# Change the views to use reactions instead of votes
class AnalyticsChangeVotesToReactions < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_posts, version: 4, revert_to_version: 3
    update_view :analytics_fact_participations, version: 4, revert_to_version: 3
  end
end
