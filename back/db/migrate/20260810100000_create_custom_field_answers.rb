# frozen_string_literal: true

class CreateCustomFieldAnswers < ActiveRecord::Migration[7.2]
  def change
    create_table :custom_field_answers, id: :uuid do |t|
      t.references :answerable, polymorphic: true, null: false, type: :uuid, index: false
      t.references :custom_field, type: :uuid, foreign_key: { on_delete: :cascade }
      t.string :key, null: false
      t.jsonb :value, null: false

      t.timestamps
    end

    add_index :custom_field_answers, %i[answerable_type answerable_id key],
      unique: true,
      name: 'index_custom_field_answers_on_answerable_and_key'
    add_index :custom_field_answers, %i[key answerable_type]
  end
end
