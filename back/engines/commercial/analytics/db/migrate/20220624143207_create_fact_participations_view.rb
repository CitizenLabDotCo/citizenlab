# frozen_string_literal: true

class CreateFactParticipationsView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_participations
  end
end
