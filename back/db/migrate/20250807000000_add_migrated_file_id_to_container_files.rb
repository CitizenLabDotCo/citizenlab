# frozen_string_literal: true

class AddMigratedFileIdToContainerFiles < ActiveRecord::Migration[7.1]
  def change
    # Adding a column to mark migrated files across all legacy file tables. This allows
    # migrated files to be treated as deleted while still retaining them in the database,
    # making it possible to revert the migration if needed.
    container_file_tables = %i[
      event_files
      phase_files
      project_files
      idea_files
      project_folders_files
      static_page_files
    ]

    container_file_tables.each do |table|
      add_reference table, :migrated_file,
        foreign_key: { to_table: :files },
        type: :uuid, null: true, index: true,
        comment: 'References the Files::File record after migration to new file system'
    end
  end
end
