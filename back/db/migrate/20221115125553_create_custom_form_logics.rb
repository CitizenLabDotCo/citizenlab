# frozen_string_literal: true

class CreateCustomFormLogics < ActiveRecord::Migration[6.1]
  def change
    create_table :custom_form_logics, id: :uuid do |t|
      t.references :source_field, foreign_key: { to_table: :custom_fields }, index: true, type: :uuid, null: false
      t.references :target_field, foreign_key: { to_table: :custom_fields }, index: true, type: :uuid, null: false
      t.jsonb :condition_value_select
      t.integer :condition_value_number
      t.string :condition_operator
      t.string :action
      t.integer :ordering, null: false

      t.timestamps
    end
  end
end
