# frozen_string_literal: true

class AddCreationPhaseIdToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :creation_phase_id, :uuid, null: true
  end
end
