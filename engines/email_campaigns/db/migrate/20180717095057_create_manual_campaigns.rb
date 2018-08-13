class CreateManualCampaigns < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_manual_campaigns, id: :uuid do |t|
      t.datetime :sent_at
      t.references :author, foreign_key: { to_table: :users }, type: :uuid
      t.string :sender, allow_nil: false
      t.string :reply_to, allow_nil: false
      t.jsonb :subject_multiloc, default: {}
      t.jsonb :body_multiloc, default: {}

      t.timestamps
    end
  end
end
