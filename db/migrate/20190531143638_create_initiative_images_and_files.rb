class CreateInitiativeImagesAndFiles < ActiveRecord::Migration[5.2]
  def change
    add_column :initiatives, :header_bg, :string

    create_table :initiative_images, id: :uuid do |t|
      t.references :initiative, foreign_key: true, type: :uuid, index: true
      t.string :image
      t.integer :ordering
      t.timestamps
    end

    create_table :initiative_files, id: :uuid do |t|
      t.references :initiative, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.string :name
      t.integer :ordering
      t.timestamps
    end
  end
end
