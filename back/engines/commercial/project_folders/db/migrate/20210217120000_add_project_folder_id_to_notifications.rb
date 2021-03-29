class AddProjectFolderIdToNotifications < ActiveRecord::Migration[6.0]
  def change
    add_column :notifications, :project_folder_id, :uuid, null: true, index: true
  end
end
