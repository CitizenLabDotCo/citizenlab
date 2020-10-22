class RenameProjectFoldersTables < ActiveRecord::Migration[6.0]
  def change
    rename_table :project_folders, :project_folders_project_folders
    rename_table :project_folder_files, :project_folders_project_folder_files
    rename_table :project_folder_images, :project_folders_project_folder_images
  end
end
