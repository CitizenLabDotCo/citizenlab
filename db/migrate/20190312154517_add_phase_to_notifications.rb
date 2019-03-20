class AddPhaseToNotifications < ActiveRecord::Migration[5.2]
  def change
    add_reference :notifications, :phase, foreign_key: true, type: :uuid, :default => nil
  end
end
