class AddSpaceToFolders < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_reference :project_folders_folders, :space, type: :uuid, foreign_key: true, index: true
    end
  end
end
