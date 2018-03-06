class CreateCustomFieldOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :custom_field_options, id: :uuid do |t|
      t.references :custom_field, foreign_key: true, type: :uuid
      t.string :key
      t.jsonb :title_multiloc, default: {}
      t.integer :ordering

      t.timestamps
    end

    add_index :custom_field_options, [:custom_field_id, :key], unique: true
  end
end
