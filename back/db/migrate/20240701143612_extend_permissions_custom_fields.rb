# frozen_string_literal: true

class ExtendPermissionsCustomFields < ActiveRecord::Migration[7.0]
  def change
    rename_table :permissions_custom_fields, :permissions_fields
    add_column :permissions_fields, :field_type, :string, default: 'custom_field'
    add_column :permissions_fields, :verified, :boolean, default: false
    add_column :permissions_fields, :enabled, :boolean, default: true
  end
end
