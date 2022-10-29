# frozen_string_literal: true

# This migration comes from analytics (originally 20220624143207)

class CreateFactParticipationsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_participations
  end
end
