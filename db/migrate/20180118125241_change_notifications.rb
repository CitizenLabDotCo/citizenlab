class ChangeNotifications < ActiveRecord::Migration[5.1]
  def change
  	change_column :notifications, :idea_id, :uuid, foreign_key: { to_table: :ideas }, using: 'idea_id::uuid'
  	change_column :notifications, :comment_id, :uuid, foreign_key: { to_table: :comments }, using: 'comment_id::uuid'
  	change_column :notifications, :project_id, :uuid, foreign_key: { to_table: :projects }, using: 'project_id::uuid'

  	remove_foreign_key :notifications, :users # once for initiating_user_id
  	remove_foreign_key :notifications, :users # once for recipient_id

  	add_foreign_key :notifications, :users, column: :initiating_user_id
    add_foreign_key :notifications, :users, column: :recipient_id
  end
end
