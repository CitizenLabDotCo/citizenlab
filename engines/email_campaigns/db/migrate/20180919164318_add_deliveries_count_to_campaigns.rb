class AddDeliveriesCountToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :email_campaigns_campaigns, :deliveries_count, :integer, null: false, default: 0
  end
end
