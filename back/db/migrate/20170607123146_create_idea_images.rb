class CreateIdeaImages < ActiveRecord::Migration[5.0]
  def change
    create_table :idea_images, id: :uuid do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.string :image
      t.integer :ordering
      t.timestamps
    end

    remove_column :ideas, :images
  end
end
