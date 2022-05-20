# frozen_string_literal: true

class UpdateNotificationsWithPolymorphicPostStatus < ActiveRecord::Migration[5.2]
  def change
    rename_column :notifications, :idea_status_id, :post_status_id
    remove_foreign_key :notifications, column: :post_status_id
    add_column :notifications, :post_status_type, :string

    add_index :notifications, %i[post_status_id post_status_type]

    Notification.where.not(post_status_id: nil).update_all(post_status_type: 'IdeaStatus')
  end
end
