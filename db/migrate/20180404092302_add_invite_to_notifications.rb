class AddInviteToNotifications < ActiveRecord::Migration[5.1]
  def change
  	add_reference :notifications, :invite, foreign_key: true, type: :uuid, default: nil
  end
end
