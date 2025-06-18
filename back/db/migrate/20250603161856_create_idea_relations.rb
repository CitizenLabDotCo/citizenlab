# frozen_string_literal: true

class CreateIdeaRelations < ActiveRecord::Migration[7.1]
  def change
    create_table :idea_relations, id: :uuid do |t|
      t.references :idea, null: false, foreign_key: true, type: :uuid, index: true
      t.references :related_idea, null: false, foreign_key: { to_table: :ideas }, type: :uuid, index: true

      t.timestamps
    end

    add_index :idea_relations, %i[idea_id related_idea_id], unique: true
  end
end
