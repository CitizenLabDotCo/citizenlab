# frozen_string_literal: true

# Ensures a file can't be added to multiple projects.
#
# The first specification for the file feature (360 Input) allowed files to be associated
# with multiple projects. That's the reason why we opted for a join table instead of a
# simple foreign key on the +files+ table. However, for the sake of simplicity (in terms
# of permission logic and product behavior), we decided that files should only belong to
# at most one project. This migration enforces that constraint.
class AddUniqueIndexToFilesProjectsFileId < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    remove_index :files_projects, :file_id
    add_index :files_projects, :file_id, unique: true, algorithm: :concurrently
  end
end
