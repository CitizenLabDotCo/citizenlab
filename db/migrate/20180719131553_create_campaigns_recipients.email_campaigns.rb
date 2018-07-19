# This migration comes from email_campaigns (originally 20180719124140)
class CreateCampaignsRecipients < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_campaigns_recipients, id: :uuid do |t|
      t.references :campaign, foreign_key: { to_table: :email_campaigns_campaigns }, type: :uuid, index: true
      t.references :user, type: :uuid, index: true
      t.string :delivery_status, nil: false
      t.timestamps
      t.index [:campaign_id, :user_id], unique: true, name: :index_campaigns_users
    end

  end
end
