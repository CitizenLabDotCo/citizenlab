class CreateFilesProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :files_projects, id: :uuid do |t|
      t.references :file, null: false, type: :uuid, foreign_key: true
      t.references :project, null: false, type: :uuid, foreign_key: true

      t.timestamps
    end

    add_index :files_projects, %i[file_id project_id], unique: true
  end
end
