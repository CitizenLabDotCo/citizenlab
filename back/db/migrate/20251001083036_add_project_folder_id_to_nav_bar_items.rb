class AddProjectFolderIdToNavBarItems < ActiveRecord::Migration[7.1]
  def change
    add_column :nav_bar_items, :project_folder_id, :uuid
    add_foreign_key :nav_bar_items, :project_folders_folders, column: :project_folder_id, validate: false
  end
end
