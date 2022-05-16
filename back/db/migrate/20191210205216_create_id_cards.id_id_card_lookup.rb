# frozen_string_literal: true

# This migration comes from verification (originally 20191210194054)
class CreateIdCards < ActiveRecord::Migration[5.2]
  def change
    create_table :verification_id_cards, id: :uuid do |t|
      t.string :hashed_card_id, index: true, unique: true
    end
  end
end
