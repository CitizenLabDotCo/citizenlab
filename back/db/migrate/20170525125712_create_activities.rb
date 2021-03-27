class CreateActivities < ActiveRecord::Migration[5.0]
  def change
    create_table :activities, id: :uuid do |t|
      t.references :item, type: :uuid , polymorphic: true, index: true, null: false
      t.string :action, null: false
      t.jsonb :payload, default: {}, null: false
      t.references :user, foreign_key: true, type: :uuid, null: true

      t.datetime "acted_at", null: false, index: true
      t.datetime "created_at", null: false
    end
  end
end
