class CreateCustomFieldBins < ActiveRecord::Migration[7.1]
  def change
    create_table :custom_field_bins, id: :uuid do |t|
      t.string :type, null: false
      t.references :custom_field, type: :uuid, index: true, foreign_key: true
      t.references :custom_field_option, type: :uuid, null: true, index: true, foreign_key: true
      t.jsonb :values, null: true
      t.int4range :range, null: true

      t.timestamps
    end
  end
end
