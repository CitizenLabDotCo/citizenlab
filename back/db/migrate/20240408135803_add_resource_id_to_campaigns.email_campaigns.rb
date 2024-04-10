# This migration comes from email_campaigns (originally 20240408135255)
class AddResourceIdToCampaigns < ActiveRecord::Migration[7.0]
  def change
    add_column :email_campaigns_campaigns, :resource_id, :string

    add_index :email_campaigns_campaigns, :resource_id
  end
end
