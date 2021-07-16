class CreateInappropriateContentFlags < ActiveRecord::Migration[6.0]
  def change
    create_table :flag_inappropriate_content_inappropriate_content_flags, id: :uuid do |t|
      t.uuid :flaggable_id, null: false
      t.string :flaggable_type, null: false
      t.timestamp :deleted_at
      t.string :toxicity_label

      t.timestamps
    end

    add_index :flag_inappropriate_content_inappropriate_content_flags, [:flaggable_id, :flaggable_type], name: :inappropriate_content_flags_flaggable
  end
end
