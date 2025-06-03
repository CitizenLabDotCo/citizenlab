# frozen_string_literal: true

class CreateRelatedIdeas < ActiveRecord::Migration[7.1]
  def change
    create_table :related_ideas, id: :uuid do |t|
      t.references :idea, null: false, foreign_key: true, type: :uuid, index: true
      t.references :related_idea, null: false, foreign_key: { to_table: :ideas }, type: :uuid, index: true

      t.timestamps
    end

    add_index :related_ideas, %i[idea_id related_idea_id], unique: true
  end
end
