class DropParentResourceForeignKeyConstraintsFromLegacyFileTables < ActiveRecord::Migration[7.1]
  def change
    reversible do |dir|
      dir.up do
        remove_foreign_key :idea_files, :ideas, column: :idea_id, if_exists: true
        remove_foreign_key :project_files, :projects, column: :project_id, if_exists: true
        remove_foreign_key :event_files, :events, column: :event_id, if_exists: true
        remove_foreign_key :phase_files, :phases, column: :phase_id, if_exists: true
        remove_foreign_key :static_page_files, :static_pages, column: :static_page_id, if_exists: true
        remove_foreign_key :project_folders_files, :project_folders_folders, column: :project_folder_id, if_exists: true
      end

      dir.down do
        add_foreign_key :idea_files, :ideas, column: :idea_id
        add_foreign_key :project_files, :projects, column: :project_id
        add_foreign_key :event_files, :events, column: :event_id
        add_foreign_key :phase_files, :phases, column: :phase_id
        add_foreign_key :static_page_files, :static_pages, column: :static_page_id
        add_foreign_key :project_folders_files, :project_folders_folders, column: :project_folder_id
      end
    end
  end
end
