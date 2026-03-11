# frozen_string_literal: true

class MakeCustomFieldMatrixStatementsOrderingConstraintDeferrable < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      execute <<~SQL
        ALTER TABLE custom_field_matrix_statements
          ADD CONSTRAINT custom_field_matrix_statements_field_id_ordering_unique
          UNIQUE (custom_field_id, ordering)
          DEFERRABLE INITIALLY IMMEDIATE
      SQL
    end
  end

  def down
    safety_assured do
      execute <<~SQL
        ALTER TABLE custom_field_matrix_statements
          DROP CONSTRAINT custom_field_matrix_statements_field_id_ordering_unique
      SQL
    end
  end
end
