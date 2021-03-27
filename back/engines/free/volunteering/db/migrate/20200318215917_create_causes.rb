class CreateCauses < ActiveRecord::Migration[6.0]
  def change
    create_table :volunteering_causes, id: :uuid do |t|
      t.uuid :participation_context_id, null: false
      t.string :participation_context_type, null: false
      t.jsonb :title_multiloc, default: {}, null: false
      t.jsonb :description_multiloc, default: {}, null: false
      t.integer :volunteers_count, null: false, default: 0
      t.string :image, null: true
      t.integer :ordering, null: false, index: true

      t.timestamps
      t.index ["participation_context_type", "participation_context_id"], name: "index_volunteering_causes_on_participation_context"
    end
  end
end
