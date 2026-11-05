# frozen_string_literal: true

# This migration comes from webhooks (originally 20251022000002)
class CreateWebhooksDeliveries < ActiveRecord::Migration[7.1]
  def change
    create_table :webhooks_deliveries, id: :uuid do |t|
      t.uuid :webhooks_subscription_id, null: false
      t.uuid :activity_id, null: false
      t.string :event_type, null: false
      t.string :status, null: false, default: 'pending'
      t.integer :attempts, default: 0, null: false
      t.integer :response_code
      t.text :response_body
      t.text :error_message
      t.datetime :last_attempt_at
      t.datetime :succeeded_at
      t.timestamps

      t.index :webhooks_subscription_id
      t.index :activity_id
      t.index %i[webhooks_subscription_id status]
      t.index :created_at
      t.index %i[status created_at]
    end

    add_foreign_key :webhooks_deliveries, :webhooks_subscriptions, on_delete: :cascade, validate: false
    add_foreign_key :webhooks_deliveries, :activities, on_delete: :cascade, validate: false
  end
end
