# frozen_string_literal: true

# This migration comes from analytics (originally 20230127201927)

class UpdateFactParticipationsTypeParent < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_participations, version: 3, revert_to_version: 2
  end
end
