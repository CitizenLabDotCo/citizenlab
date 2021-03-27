class CreateProjectFolders < ActiveRecord::Migration[6.0]
  def change
    create_table :project_folders, id: :uuid do |t|
      t.jsonb :title_multiloc
      t.jsonb :description_multiloc
      t.jsonb :description_preview_multiloc
      t.string :header_bg
      t.string :slug, index: true, unique: true
      t.integer :projects_count, null: false, default: 0
      
      t.timestamps
    end
  end
end
