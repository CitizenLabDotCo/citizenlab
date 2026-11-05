# frozen_string_literal: true

# This migration comes from webhooks (originally 20251022000003)
class ValidateWebhooksForeignKeys < ActiveRecord::Migration[7.1]
  def change
    validate_foreign_key :webhooks_subscriptions, :projects
    validate_foreign_key :webhooks_deliveries, :webhooks_subscriptions
    validate_foreign_key :webhooks_deliveries, :activities
  end
end
