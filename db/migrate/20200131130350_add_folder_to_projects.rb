class AddFolderToProjects < ActiveRecord::Migration[6.0]
  def change
    add_reference :projects, :folder, foreign_key: {to_table: :project_folders}, type: :uuid
    remove_index :projects, name: "index_projects_on_created_at"
  end
end
