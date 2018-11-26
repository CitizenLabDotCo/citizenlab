class CreateMachineTranslations < ActiveRecord::Migration[5.1]
  def change
    create_table :machine_translations, id: :uuid do |t|
      t.jsonb :translation
      t.uuid :translatable_id
      t.string  :translatable_type

      t.timestamps
    end
  end
end
