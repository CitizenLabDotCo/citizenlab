class AddResourceIdToCustomFields < ActiveRecord::Migration[6.0]
  def change
    add_column :custom_fields, :resource_id, :uuid, null: true

    add_index :custom_fields, [:resource_type, :resource_id]
  end
end