# This migration comes from email_campaigns (originally 20180719124025)
class CreateManualCampaignsGroups < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_manual_campaigns_groups, id: :uuid do |t|
      t.references :manual_campaign, foreign_key: { to_table: :email_campaigns_manual_campaigns }, type: :uuid, index: { name: 'index_manual_campaigns_groups_on_manual_campaign_id' }
      t.references :group, type: :uuid, index: true
      t.timestamps
      t.index [:manual_campaign_id, :group_id], unique: true, name: :index_manual_campaigns_groups
    end

  end
end
