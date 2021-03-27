class CreateCustomFields < ActiveRecord::Migration[5.1]
  def change
    create_table :custom_fields, id: :uuid do |t|
      t.string :resource_type
      t.string :key
      t.string :input_type
      t.jsonb :title_multiloc, default: {}
      t.jsonb :description_multiloc, default: {}
      t.boolean :required, default: false
      t.integer :ordering

      t.timestamps
    end

    add_index :custom_fields, [:resource_type, :key], unique: true
  end
end
