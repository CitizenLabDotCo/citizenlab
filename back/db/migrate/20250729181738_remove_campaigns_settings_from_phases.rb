class RemoveCampaignsSettingsFromPhases < ActiveRecord::Migration[7.1]
  def change
    remove_column :phases, :campaigns_settings, :string
  end
end
