class AddFolderToProjects < ActiveRecord::Migration[6.0]
  def change
    add_reference :projects, :folder, foreign_key: {to_table: :project_folders}, type: :uuid
  end
end
