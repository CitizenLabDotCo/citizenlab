# frozen_string_literal: true

class AddPlacementTypeToPhases < ActiveRecord::Migration[7.2]
  def change
    add_column :phases, :placement_type, :string, null: false, default: 'on_timeline'
  end
end
