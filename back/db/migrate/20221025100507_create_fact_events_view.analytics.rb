# frozen_string_literal: true

# This migration comes from analytics (originally 20221025105931)

class CreateFactEventsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_events
  end
end
