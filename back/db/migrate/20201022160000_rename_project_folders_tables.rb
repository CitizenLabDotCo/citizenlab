# frozen_string_literal: true

class RenameProjectFoldersTables < ActiveRecord::Migration[6.0]
  def change
    rename_table :project_folders, :project_folders_folders
    rename_table :project_folder_files, :project_folders_files
    rename_table :project_folder_images, :project_folders_images
  end
end
