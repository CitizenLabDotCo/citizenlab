# frozen_string_literal: true

class UpdateFactParticipationsView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_participations, version: 2, revert_to_version: 1
  end
end
