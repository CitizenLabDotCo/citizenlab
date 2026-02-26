# frozen_string_literal: true

# This migration comes from email_campaigns (originally 20260226100000)
class AddScheduledAtToCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :email_campaigns_campaigns, :scheduled_at, :datetime, null: true
  end
end
