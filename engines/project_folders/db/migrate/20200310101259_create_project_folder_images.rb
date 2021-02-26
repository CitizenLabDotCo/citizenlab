class CreateProjectFolderImages < ActiveRecord::Migration[6.0]
  def change
    create_table :project_folder_images, id: :uuid do |t|
      t.references :project_folder, foreign_key: true, type: :uuid, index: true
      t.string :image
      t.integer :ordering
      t.timestamps
    end
  end
end
