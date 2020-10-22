class CreateProjectFolderFiles < ActiveRecord::Migration[6.0]
  def change
    create_table :project_folder_files, id: :uuid do |t|
      t.references :project_folder, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.string :name
      t.integer :ordering

      t.timestamps
    end
  end
end
