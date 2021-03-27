class CreateProjectImages < ActiveRecord::Migration[5.1]
  def change
    create_table :project_images, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid, index: true
      t.string :image
      t.integer :ordering
      t.timestamps
    end

    add_column :projects, :header_bg, :string
    remove_column :projects, :images
  end
end
