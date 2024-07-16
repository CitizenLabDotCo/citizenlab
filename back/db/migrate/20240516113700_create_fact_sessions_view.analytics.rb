# frozen_string_literal: true

# This migration comes from analytics (originally 20240516113500)

class CreateFactSessionsView < ActiveRecord::Migration[7.0]
  def change
    create_view :analytics_fact_sessions
  end
end
