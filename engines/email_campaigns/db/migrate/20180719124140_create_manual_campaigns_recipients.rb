class CreateManualCampaignsRecipients < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_manual_campaigns_recipients, id: :uuid do |t|
      t.references :manual_campaign, foreign_key: { to_table: :email_campaigns_manual_campaigns }, type: :uuid, index: {name: 'index_manual_campaigns_recipients_on_manual_campaign_id'}
      t.references :user, type: :uuid, index: true
      t.string :delivery_status, nil: false
      t.timestamps
      t.index [:manual_campaign_id, :user_id], unique: true, name: :index_manual_campaigns_users
    end

  end
end
