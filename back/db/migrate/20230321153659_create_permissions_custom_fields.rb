# frozen_string_literal: true

class CreatePermissionsCustomFields < ActiveRecord::Migration[6.1]
  def change
    create_table :permissions_custom_fields, id: :uuid do |t|
      t.references :permission, foreign_key: true, type: :uuid, null: false
      t.references :custom_field, foreign_key: true, type: :uuid, null: false
      t.boolean :required, null: false, default: true

      t.timestamps
      t.index %i[permission_id custom_field_id], unique: true, name: :index_permission_field
    end
  end
end
