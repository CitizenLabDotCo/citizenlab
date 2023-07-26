# frozen_string_literal: true

class CreateAnalyses < ActiveRecord::Migration[7.0]
  def change
    create_table :analysis_analyses, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid, index: true, null: true
      t.references :phase, foreign_key: true, type: :uuid, index: true, null: true

      t.timestamps
    end
  end
end
