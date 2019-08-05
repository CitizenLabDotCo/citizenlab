class AddInitiativeToNotifications < ActiveRecord::Migration[5.2]
  def change
    add_reference :notifications, :initiative, foreign_key: true, type: :uuid, :default => nil
  end
end
