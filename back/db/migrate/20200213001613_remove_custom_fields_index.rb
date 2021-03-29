class RemoveCustomFieldsIndex < ActiveRecord::Migration[6.0]
  def change
    remove_index :custom_fields, [:resource_type, :key]
  end
end
