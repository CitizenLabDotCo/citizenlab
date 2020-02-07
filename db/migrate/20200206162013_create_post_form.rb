class CreatePostForm < ActiveRecord::Migration[6.0]
  def change
    create_table :post_forms, id: :uuid do |t|
      t.timestamps
    end
  end
end
