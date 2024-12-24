class RemoveInitiativesFromNotifications < ActiveRecord::Migration[7.0]
  def change
    # post -> idea
    execute <<~SQL.squish
      DELETE FROM notifications
      WHERE post_type IS NOT NULL AND post_type != 'Idea';
    SQL
    remove_column :notifications, :post_type, :string
    rename_column :notifications, :post_id, :idea_id
    add_foreign_key :notifications, :ideas, column: :idea_id

    # post_status -> idea_status
    execute <<~SQL.squish
      DELETE FROM notifications
      WHERE post_status_type IS NOT NULL AND post_status_type != 'IdeaStatus';
    SQL
    remove_column :notifications, :post_status_type, :string
    rename_column :notifications, :post_status_id, :idea_status_id
    add_foreign_key :notifications, :idea_statuses, column: :idea_status_id
  end
end
