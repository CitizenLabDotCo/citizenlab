# frozen_string_literal: true

class AddAutoshareAttributeToPhaseContext < ActiveRecord::Migration[7.0]
  def change
    add_column :phases, :autoshare_results_enabled, :boolean, default: true, null: false
  end
end
