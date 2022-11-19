# frozen_string_literal: true

class CreateFactEventsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_events
  end
end
