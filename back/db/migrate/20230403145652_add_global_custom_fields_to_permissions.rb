# frozen_string_literal: true

class AddGlobalCustomFieldsToPermissions < ActiveRecord::Migration[6.1]
  def change
    add_column :permissions, :global_custom_fields, :boolean, null: false, default: false
    ActiveRecord::Base.connection.execute <<~SQL.squish
      UPDATE permissions
      SET global_custom_fields = true
      WHERE permissions.permitted_by = 'users'
    SQL
  end
end
