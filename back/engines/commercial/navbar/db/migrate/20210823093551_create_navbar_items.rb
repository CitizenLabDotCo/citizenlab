class CreateNavbarItems < ActiveRecord::Migration[6.1]
  def change
    create_table :navbar_items, id: :uuid do |t|
      t.references :page, foreign_key: true, type: :uuid, index: true, null: false

      t.string :type
      t.jsonb :title_multiloc, default: {}
      t.boolean :visible, default: true
      t.integer :position

      t.timestamps
    end
  end
end
