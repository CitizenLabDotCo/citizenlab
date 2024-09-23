# frozen_string_literal: true

# This migration comes from analytics (originally 20240918105300)

class UpdateFactParticipationsViewV7 < ActiveRecord::Migration[7.0]
  def change
    update_view :analytics_fact_participations, version: 7, revert_to_version: 6
  end
end
