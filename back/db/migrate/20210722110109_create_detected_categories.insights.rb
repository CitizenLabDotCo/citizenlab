# frozen_string_literal: true

class CreateDetectedCategories < ActiveRecord::Migration[6.0]
  def change
    create_table :insights_detected_categories, id: :uuid do |t|
      t.string :name, null: false
      t.references :view, type: :uuid, null: false, index: true, foreign_key: { to_table: :insights_views }

      t.timestamps

      t.index %i[view_id name], unique: true
    end
  end
end
