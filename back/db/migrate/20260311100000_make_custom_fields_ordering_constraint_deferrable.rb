# frozen_string_literal: true

class MakeCustomFieldsOrderingConstraintDeferrable < ActiveRecord::Migration[7.2]
  def up
    remove_index :custom_fields, name: :index_custom_fields_on_resource_id_and_ordering_unique

    safety_assured do
      execute <<~SQL
        ALTER TABLE custom_fields
          ADD CONSTRAINT custom_fields_resource_id_ordering_unique
          UNIQUE (resource_id, ordering)
          DEFERRABLE INITIALLY IMMEDIATE
      SQL
    end
  end

  def down
    safety_assured do
      execute <<~SQL
        ALTER TABLE custom_fields
          DROP CONSTRAINT custom_fields_resource_id_ordering_unique
      SQL
    end

    add_index :custom_fields, %i[resource_id ordering],
      unique: true,
      name: :index_custom_fields_on_resource_id_and_ordering_unique
  end
end
