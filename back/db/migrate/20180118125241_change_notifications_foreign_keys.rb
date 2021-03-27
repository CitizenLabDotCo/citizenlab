class ChangeNotificationsForeignKeys < ActiveRecord::Migration[5.1]
  def change
  	change_column :notifications, :idea_id, :uuid, null: true, using: 'idea_id::uuid'
  	change_column :notifications, :comment_id, :uuid, null: true, using: 'comment_id::uuid'
  	change_column :notifications, :project_id, :uuid, null: true, using: 'project_id::uuid'

    add_foreign_key :notifications, :ideas, column: :idea_id
    add_foreign_key :notifications, :comments, column: :comment_id
    add_foreign_key :notifications, :projects, column: :project_id
  end
end
