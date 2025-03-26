# frozen_string_literal: true

class AddPopupFrequencyToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :survey_popup_frequency, :integer, null: true
  end
end
