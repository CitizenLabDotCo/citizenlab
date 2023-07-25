# frozen_string_literal: true

class CreateAnalysesTags < ActiveRecord::Migration[7.0]
    def change
      create_table :analyses_tags, id: :uuid do |t|
        t.string :name, null: false
        t.string :tag_type, null: false
        t.references :analysis, type: :uuid, null: false, index: true, foreign_key: { to_table: :analysis_analyses }
  
        t.timestamps
  
        t.index %i[analysis_id name], unique: true
      end
    end
  end
  