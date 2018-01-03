class AddSpamReportToNotifications < ActiveRecord::Migration[5.1]
  def change
  	add_reference :notifications, :spam_report, foreign_key: true, type: :uuid, :default => nil
  end
end
