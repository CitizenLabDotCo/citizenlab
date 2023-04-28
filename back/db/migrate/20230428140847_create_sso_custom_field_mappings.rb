# frozen_string_literal: true

class CreateSsoCustomFieldMappings < ActiveRecord::Migration[6.1]
  def change
    create_table :sso_custom_field_mappings, id: :uuid do |t|
      t.references :key_custom_field, foreign_key: { to_table: :custom_fields }, type: :uuid
      t.string :key_custom_field_value
      t.references :value_custom_field, foreign_key: { to_table: :custom_fields }, type: :uuid
      t.string :value_custom_field_value

      t.index %i[key_custom_field_id key_custom_field_value], name: :index_sso_custom_field_mappings_on_key

      t.timestamps
    end
  end
end
