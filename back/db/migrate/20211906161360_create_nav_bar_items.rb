class CreateNavBarItems < ActiveRecord::Migration[6.1]
  def change
    create_table :nav_bar_items, id: :uuid do |t|
      t.string :code, null: false, index: true
      t.integer :ordering, null: true, index: true
      t.jsonb :title_multiloc, null: true
      t.references :page, foreign_key: true, type: :uuid, null: true

      t.timestamps
    end
  end
end
