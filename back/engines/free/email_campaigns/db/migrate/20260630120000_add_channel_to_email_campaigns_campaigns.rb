# frozen_string_literal: true

class AddChannelToEmailCampaignsCampaigns < ActiveRecord::Migration[7.2]
  def change
    add_column :email_campaigns_campaigns, :channel, :string, null: false, default: 'email'
  end
end
