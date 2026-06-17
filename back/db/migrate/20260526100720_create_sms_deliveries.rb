# frozen_string_literal: true

class CreateSmsDeliveries < ActiveRecord::Migration[7.2]
  def change
    create_table :sms_deliveries, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, index: true
      t.references :campaign, type: :uuid, null: true, index: true,
        foreign_key: { to_table: :email_campaigns_campaigns, on_delete: :nullify }
      t.string :phone_number, null: false
      t.text :body, null: false
      t.string :message_sid
      t.string :status, null: false
      t.string :error_message
      t.timestamps
    end
  end
end
