# frozen_string_literal: true

class CreateCosponsorships < ActiveRecord::Migration[7.0]
  def change
    create_table :cosponsorships, id: :uuid do |t|
      t.string :status, default: 'pending', null: false
      t.references :user, foreign_key: true, type: :uuid, index: true, null: false
      t.references :idea, foreign_key: true, type: :uuid, index: true, null: false

      t.timestamps
    end
  end
end
