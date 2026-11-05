# This migration comes from email_campaigns (originally 20260811000000)
class AddSegmentsCountToSmsDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_column :sms_deliveries, :segments_count, :integer
  end
end
