# frozen_string_literal: true

class AddAutoshareAttributeToPhaseContext < ActiveRecord::Migration[7.0]
  def change
    %i[phases].each do |tablename|
      add_column tablename, :autoshare_results_enabled, :boolean, default: true, null: false
    end
  end
end
