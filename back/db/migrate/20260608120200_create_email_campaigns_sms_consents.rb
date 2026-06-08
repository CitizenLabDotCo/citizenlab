# frozen_string_literal: true

class CreateEmailCampaignsSmsConsents < ActiveRecord::Migration[7.2]
  def change
    create_table :email_campaigns_sms_consents, id: :uuid do |t|
      t.string :campaign_type, null: false
      t.references :user, type: :uuid, null: false, foreign_key: true, index: true
      t.boolean :consented, null: false, default: false
      t.timestamps
    end

    add_index :email_campaigns_sms_consents, %i[campaign_type user_id], unique: true
  end
end
