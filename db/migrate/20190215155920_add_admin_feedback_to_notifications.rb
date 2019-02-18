class AddAdminFeedbackToNotifications < ActiveRecord::Migration[5.2]
  def change
    add_reference :notifications, :admin_feedback, foreign_key: true, type: :uuid, :default => nil
  end
end
