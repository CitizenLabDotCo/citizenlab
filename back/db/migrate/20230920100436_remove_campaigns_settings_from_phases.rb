# frozen_string_literal: true

class RemoveCampaignsSettingsFromPhases < ActiveRecord::Migration[7.0]
  def change
    remove_column :phases, :campaigns_settings
  end
end
