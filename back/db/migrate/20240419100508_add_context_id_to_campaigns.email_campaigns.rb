# This migration comes from email_campaigns (originally 20240419100338)
class AddContextIdToCampaigns < ActiveRecord::Migration[7.0]
  def change
    add_column :email_campaigns_campaigns, :context_id, :uuid

    add_index :email_campaigns_campaigns, :context_id
  end
end
