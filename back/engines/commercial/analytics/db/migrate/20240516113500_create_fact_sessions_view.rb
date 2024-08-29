# frozen_string_literal: true

class CreateFactSessionsView < ActiveRecord::Migration[7.0]
  def change
    create_view :analytics_fact_sessions
  end
end
