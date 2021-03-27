# This migration comes from project_folders (originally 20210217120000)
class AddProjectFolderIdToNotifications < ActiveRecord::Migration[6.0]
  def change
    add_column :notifications, :project_folder_id, :uuid, null: true, index: true
  end
end
