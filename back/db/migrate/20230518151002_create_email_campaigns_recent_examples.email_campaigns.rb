# frozen_string_literal: true

# This migration comes from email_campaigns (originally 20230518144244)

class CreateEmailCampaignsRecentExamples < ActiveRecord::Migration[6.1]
  def change
    create_table :email_campaigns_recent_examples, id: :uuid do |t|
      t.string :type, null: false, index: true
      t.string :mail_body_html, null: false
      t.string :locale, null: false
      t.string :subject, null: false
      t.string :recipient, null: false

      t.timestamps
    end
  end
end
