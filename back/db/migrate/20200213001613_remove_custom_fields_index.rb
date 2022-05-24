# frozen_string_literal: true

class RemoveCustomFieldsIndex < ActiveRecord::Migration[6.0]
  def change
    remove_index :custom_fields, %i[resource_type key]
  end
end
