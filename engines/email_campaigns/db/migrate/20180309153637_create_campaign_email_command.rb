class CreateCampaignEmailCommand < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_campaign_email_commands, id: :uuid do |t|
      t.string :campaign
      t.references :recipient, foreign_key: { to_table: :users }, type: :uuid
      t.timestamp :commanded_at
      t.jsonb :tracked_content

      t.timestamps
    end
  end
end
