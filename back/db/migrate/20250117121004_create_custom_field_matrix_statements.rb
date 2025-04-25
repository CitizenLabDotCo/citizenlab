class CreateCustomFieldMatrixStatements < ActiveRecord::Migration[7.0]
  def change
    create_table :custom_field_matrix_statements, id: :uuid do |t|
      t.references :custom_field, foreign_key: true, null: false, type: :uuid, index: true
      t.jsonb :title_multiloc, default: {}, null: false
      t.string :key, null: false, index: true
      t.integer :ordering, null: false

      t.timestamps
    end
  end
end
