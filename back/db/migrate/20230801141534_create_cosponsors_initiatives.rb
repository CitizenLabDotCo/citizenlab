# frozen_string_literal: true

class CreateCosponsorsInitiatives < ActiveRecord::Migration[7.0]
  def change
    create_table :cosponsors_initiatives, id: :uuid do |t|
      t.references :user, foreign_key: true, type: :uuid, index: true, null: true
      t.references :initiative, foreign_key: true, type: :uuid, index: true, null: true

      t.timestamps
    end
  end
end
