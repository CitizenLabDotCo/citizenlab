class CreateMachineTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :machine_translations_machine_translations, id: :uuid do |t|
      t.uuid :translatable_id
      t.string :translatable_type
      t.string :attribute_name
      t.string :locale_to
      t.string :translation

      t.timestamps
    end
  end
end
