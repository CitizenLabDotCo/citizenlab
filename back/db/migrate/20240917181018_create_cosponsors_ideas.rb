# frozen_string_literal: true

class CreateCosponsorsIdeas < ActiveRecord::Migration[7.0]
  def change
    create_table :cosponsors_ideas, id: false do |t|
      t.references :cosponsor, foreign_key: { to_table: :users }, type: :uuid, index: true
      t.references :idea, foreign_key: true, type: :uuid, index: true
    end
  end
end
