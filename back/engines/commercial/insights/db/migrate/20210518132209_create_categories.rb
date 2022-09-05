# frozen_string_literal: true

class CreateCategories < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_categories, id: :uuid do |t|
      t.string :name, null: false
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }
      t.integer :position

      t.timestamps

      t.index %i[view_id name], unique: true
      # Ideally, it should be here to ensure data consistency, but it breaks the gem.
      # See https://github.com/brendon/acts_as_list/issues/378
      # t.index %i[view_id position], unique: true
    end
  end
end
