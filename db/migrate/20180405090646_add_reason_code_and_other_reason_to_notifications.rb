class AddReasonCodeAndOtherReasonToNotifications < ActiveRecord::Migration[5.1]
  def change
  	add_column :notifications, :reason_code, :string, null: true
  	add_column :notifications, :other_reason, :string, null: true
  end
end
