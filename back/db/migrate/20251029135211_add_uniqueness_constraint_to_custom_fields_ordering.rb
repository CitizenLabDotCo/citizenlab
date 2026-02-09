class AddUniquenessConstraintToCustomFieldsOrdering < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    # Input forms
    add_index :custom_fields, %i[resource_id ordering],
      unique: true,
      name: 'index_custom_fields_on_resource_id_and_ordering_unique',
      algorithm: :concurrently

    # Registration fields (no resource_id)
    add_index :custom_fields, :ordering,
      unique: true,
      where: 'resource_id IS NULL',
      algorithm: :concurrently
  end
end
