# This migration comes from email_campaigns (originally 20180919164318)
class AddDeliveriesCountToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :email_campaigns_campaigns, :deliveries_count, :integer, null: false, default: 0
  end
end
