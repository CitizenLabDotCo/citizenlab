# This migration comes from email_campaigns (originally 20180719131553)
class CreateDeliveries < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_deliveries, id: :uuid do |t|
      t.references :campaign, foreign_key: { to_table: :email_campaigns_campaigns }, type: :uuid, index: true, null: false
      t.references :user, type: :uuid, index: true, null: false
      t.string :delivery_status, null: false
      t.jsonb :tracked_content, default: {}
      t.datetime :sent_at, index: true
      t.timestamps

      t.index [:campaign_id, :user_id]
    end

  end
end
