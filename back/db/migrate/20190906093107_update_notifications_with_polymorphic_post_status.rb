class UpdateNotificationsWithPolymorphicPostStatus < ActiveRecord::Migration[5.2]
  def change
    rename_column :notifications, :idea_status_id, :post_status_id
    remove_foreign_key :notifications, column: :post_status_id
    add_column :notifications, :post_status_type, :string

    add_index :notifications, [:post_status_id, :post_status_type]

    Notification.where('post_status_id IS NOT NULL').update_all(post_status_type: 'IdeaStatus')
  end
end
