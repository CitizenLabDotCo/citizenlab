class CreateCampaigns < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_campaigns, id: :uuid do |t|
      t.string :type, null: false, index: true
      t.references :author, foreign_key: { to_table: :users }, type: :uuid, null: true

      # Disableable
      t.boolean :enabled, default: true

      # SenderConfigurable
      t.string :sender
      t.string :reply_to

      # Schedulable
      t.jsonb :schedule, default: {}

      # ContentConfigurable
      t.jsonb :subject_multiloc, default: {}
      t.jsonb :body_multiloc, default: {}

      t.timestamps
    end
  end
end
