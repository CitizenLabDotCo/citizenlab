# frozen_string_literal: true

class AddScheduledAtToCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :email_campaigns_campaigns, :scheduled_at, :datetime, null: true
  end
end
