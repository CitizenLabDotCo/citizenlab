class AddUniquenessConstraintToCustomFieldOptionsAndAreasOrdering < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    add_index :custom_field_options, %i[custom_field_id ordering],
      unique: true,
      name: 'index_custom_field_options_on_field_id_and_ordering_unique',
      algorithm: :concurrently

    add_index :areas, :ordering,
      unique: true,
      name: 'index_areas_on_ordering_unique',
      algorithm: :concurrently
  end
end
