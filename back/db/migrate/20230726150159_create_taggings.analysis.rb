# frozen_string_literal: true

# This migration comes from analysis (originally 20230726165913)
class CreateTaggings < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_taggings, id: :uuid do |t|
      t.references :tag, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_tags }
      t.references :input, type: :uuid, null: false, index: true, foreign_key: { to_table: :ideas }

      t.timestamps

      t.index %i[tag_id input_id], unique: true
    end
  end
end
