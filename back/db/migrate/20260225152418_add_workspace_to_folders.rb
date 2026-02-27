class AddWorkspaceToFolders < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_reference :project_folders_folders, :workspace, type: :uuid, foreign_key: true, index: true
    end
  end
end
