class AddReasonCodeAndOtherReasonToNotifications < ActiveRecord::Migration[5.1]
  def change
  	add_reference :notifications, :reason_code, type: :string, :default => nil
  	add_reference :notifications, :other_reason, type: :string, :default => nil
  end
end
