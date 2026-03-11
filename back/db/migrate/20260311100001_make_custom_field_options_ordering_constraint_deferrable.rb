# frozen_string_literal: true

class MakeCustomFieldOptionsOrderingConstraintDeferrable < ActiveRecord::Migration[7.2]
  def up
    remove_index :custom_field_options, name: :index_custom_field_options_on_field_id_and_ordering_unique

    execute <<~SQL
      ALTER TABLE custom_field_options
        ADD CONSTRAINT custom_field_options_field_id_ordering_unique
        UNIQUE (custom_field_id, ordering)
        DEFERRABLE INITIALLY IMMEDIATE
    SQL
  end

  def down
    execute <<~SQL
      ALTER TABLE custom_field_options
        DROP CONSTRAINT custom_field_options_field_id_ordering_unique
    SQL

    add_index :custom_field_options, %i[custom_field_id ordering],
      unique: true,
      name: :index_custom_field_options_on_field_id_and_ordering_unique
  end
end
