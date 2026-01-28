# frozen_string_literal: true

class RemovePrescreeningEnabledFromPhases < ActiveRecord::Migration[7.2]
  def change
    safety_assured { remove_column :phases, :prescreening_enabled, :boolean }
  end
end
