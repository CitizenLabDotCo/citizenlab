# frozen_string_literal: true

# This migration comes from analytics (originally 20221110104955)

class UpdateFactEventsView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_events, version: 2, revert_to_version: 1
  end
end
