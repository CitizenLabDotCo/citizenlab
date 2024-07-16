# frozen_string_literal: true

# This migration comes from analytics (originally 20240409150000)

class UpdateFactParticipationsViewV6 < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_participations, version: 6, revert_to_version: 5
  end
end
