class AddIdeaStatusIdToNotifications < ActiveRecord::Migration[5.1]
  def change
    add_reference :notifications, :idea_status, foreign_key: true, type: :uuid, :default => nil
  end
end
