class AddEstimatedSegmentsCountToSmsDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_column :sms_deliveries, :estimated_segments_count, :integer
  end
end
