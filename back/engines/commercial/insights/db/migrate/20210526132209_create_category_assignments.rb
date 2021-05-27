# frozen_string_literal: true

class CreateCategoryAssignments < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_category_assignments, id: :uuid do |t|
      t.references :view, type: :uuid, null: false, index: false, foreign_key: { to_table: :insights_views }
      t.references :category, type: :uuid, null: false, index: false, foreign_key: { to_table: :insights_categories }
      t.references :input, type: :uuid, null: false, index: true, polymorphic: true

      t.timestamps

      t.index %i[view_id], unique: true
      t.index %i[view_id category_id], unique: true
      t.index %i[view_id category_id input_id input_type], unique: true, name: 'index_single_category_assignment'
    end
  end
end
