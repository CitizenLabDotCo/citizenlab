# frozen_string_literal: true

# This migration comes from webhooks (originally 20251022000001)
class CreateWebhooksSubscriptions < ActiveRecord::Migration[7.1]
  def change
    create_table :webhooks_subscriptions, id: :uuid do |t|
      t.string :name, null: false
      t.string :url, null: false
      t.string :secret_token, null: false
      t.jsonb :events, default: [], null: false
      t.uuid :project_id
      t.boolean :enabled, default: true, null: false
      t.timestamps

      t.index :enabled
      t.index :project_id
      t.index :events, using: :gin
    end

    add_foreign_key :webhooks_subscriptions, :projects, on_delete: :cascade, validate: false
  end
end
