# frozen_string_literal: true

# This migration comes from email_campaigns (originally 20260630120000)
class AddChannelToEmailCampaignsCampaigns < ActiveRecord::Migration[7.2]
  def change
    add_column :email_campaigns_campaigns, :channel, :string, null: false, default: 'email'
  end
end
