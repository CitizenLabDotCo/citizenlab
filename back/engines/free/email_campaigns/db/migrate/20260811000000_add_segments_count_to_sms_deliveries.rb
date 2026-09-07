class AddSegmentsCountToSmsDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_column :sms_deliveries, :segments_count, :integer
  end
end
