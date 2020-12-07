class RenameProjectFoldersTables < ActiveRecord::Migration[6.0]

  class AdminPublication < ActiveRecord::Base
    self.table_name = 'admin_publications'
  end

  def change
    rename_table :project_folders, :project_folders_folders
    rename_table :project_folder_files, :project_folders_files
    rename_table :project_folder_images, :project_folders_images

    reversible do |dir|
      dir.up do
        AdminPublication.where(publication_type: 'ProjectFolder')
                        .update_all(publication_type: 'ProjectFolders::Folder')
      end

      dir.down do
        AdminPublication.where(publication_type: 'ProjectFolders::Folder')
                        .update_all(publication_type: 'ProjectFolder')
      end
    end
  end
end