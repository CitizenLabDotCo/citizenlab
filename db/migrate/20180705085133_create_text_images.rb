class CreateTextImages < ActiveRecord::Migration[5.1]
  def change
    create_table :text_images, id: :uuid do |t|
      t.string :imageable_type, null: false
      t.uuid :imageable_id, null: false
      t.string :imageable_field, null: true
      t.string :image

      t.timestamps
    end
  end
end
