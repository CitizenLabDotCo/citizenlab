# frozen_string_literal: true

# This migration comes from analytics (originally 20230620121811)
# Change the views to use reactions instead of votes
class AnalyticsPostsExcludeSurveys < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_posts, version: 5, revert_to_version: 4
  end
end
