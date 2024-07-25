# frozen_string_literal: true

class RenamePermissionsCustomFields < ActiveRecord::Migration[7.0]
  def change
    rename_table :permissions_custom_fields, :permissions_fields
  end
end
