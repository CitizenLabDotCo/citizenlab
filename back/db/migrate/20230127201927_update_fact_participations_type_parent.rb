# frozen_string_literal: true

class UpdateFactParticipationsTypeParent < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_participations, version: 3, revert_to_version: 2
  end
end
