class ChangeNotificationsForeignKeys < ActiveRecord::Migration[5.1]
  def change
  	change_column :notifications, :idea_id, :uuid, null: true, using: 'idea_id::uuid'
  	change_column :notifications, :comment_id, :uuid, null: true, using: 'comment_id::uuid'
  	change_column :notifications, :project_id, :uuid, null: true, using: 'project_id::uuid'

  	remove_foreign_key :notifications, :users # once for initiating_user_id
  	remove_foreign_key :notifications, :users # once for recipient_id
  	remove_foreign_key :notifications, :spam_reports

  	add_foreign_key :notifications, :users, column: :initiating_user_id, on_delete: :nullify
    add_foreign_key :notifications, :users, column: :recipient_id, on_delete: :cascade
    add_foreign_key :notifications, :spam_reports, column: :spam_report_id, on_delete: :nullify

    add_foreign_key :notifications, :ideas, column: :idea_id, on_delete: :nullify
    add_foreign_key :notifications, :comments, column: :comment_id , on_delete: :nullify
    add_foreign_key :notifications, :projects, column: :project_id, on_delete: :nullify
  end
end
