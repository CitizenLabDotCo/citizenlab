class UpdateNotificationsWithPolymorphicPost < ActiveRecord::Migration[5.2]
  def change
    rename_column :notifications, :idea_id, :post_id
    remove_foreign_key :notifications, column: :post_id
    add_column :notifications, :post_type, :string

    add_index :notifications, [:post_id, :post_type]

    Notification.where('post_id IS NOT NULL').update_all(post_type: 'Idea')
  end
end
