class AddReasonCodeAndOtherReasonToNotifications < ActiveRecord::Migration[5.1]
  def change
  	add_column :notifications, :reason_code, type: :string, :default => nil
  	add_column :notifications, :other_reason, type: :string, :default => nil
  end
end
