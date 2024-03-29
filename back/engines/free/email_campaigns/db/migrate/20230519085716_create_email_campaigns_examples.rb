# frozen_string_literal: true

class CreateEmailCampaignsExamples < ActiveRecord::Migration[6.1]
  def change
    create_table :email_campaigns_examples, id: :uuid do |t|
      t.string :campaign_class, null: false, index: true
      t.string :mail_body_html, null: false
      t.string :locale, null: false
      t.string :subject, null: false
      t.references :recipient, type: :uuid, index: true, null: true, foreign_key: { to_table: 'users' }

      t.timestamps
    end
  end
end
