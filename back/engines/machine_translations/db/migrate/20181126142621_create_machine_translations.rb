class CreateMachineTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :machine_translations_machine_translations, id: :uuid do |t|
      t.uuid :translatable_id, null: false
      t.string :translatable_type, null: false
      t.string :attribute_name, null: false
      t.string :locale_to, null: false
      t.string :translation, null: false

      t.timestamps
    end

    add_index :machine_translations_machine_translations, [:translatable_id, :translatable_type], name: :machine_translations_translatable
    add_index :machine_translations_machine_translations, [:translatable_id, :translatable_type, :attribute_name, :locale_to], unique: true, name: :machine_translations_lookup

  end
end
