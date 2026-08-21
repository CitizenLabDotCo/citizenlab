# frozen_string_literal: true

class AddCustomFieldsBehaviorToPermissions < ActiveRecord::Migration[7.2]
  def change
    add_column :permissions, :custom_fields_behavior, :string
  end
end
