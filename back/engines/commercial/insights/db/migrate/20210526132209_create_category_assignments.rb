# frozen_string_literal: true

class CreateCategoryAssignments < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_category_assignments, id: :uuid do |t|
      t.references :category, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_categories }
      t.references :input, type: :uuid, null: false, index: true, polymorphic: true
      t.boolean :approved, null: false, index: true, default: true

      t.timestamps

      t.index %i[category_id input_id input_type], unique: true, name: 'index_single_category_assignment'
    end
  end
end
