# frozen_string_literal: true

class CreateConsents < ActiveRecord::Migration[5.1]
  def change
    create_table :email_campaigns_consents, id: :uuid do |t|
      t.string :campaign_type, null: false
      t.references :user, type: :uuid, index: true, null: false
      t.boolean :consented, null: false
      t.timestamps

      t.index %i[campaign_type user_id], unique: true
    end
  end
end
