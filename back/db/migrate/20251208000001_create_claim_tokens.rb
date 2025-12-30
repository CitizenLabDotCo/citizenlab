# frozen_string_literal: true

class CreateClaimTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :claim_tokens, id: :uuid do |t|
      t.string :token, null: false
      t.string :item_type, null: false
      t.uuid :item_id, null: false
      t.datetime :expires_at, null: false
      t.references :pending_claimer, type: :uuid, foreign_key: { to_table: :users }
      t.timestamps
    end

    add_index :claim_tokens, :token, unique: true
    add_index :claim_tokens, %i[item_type item_id], unique: true
    add_index :claim_tokens, :expires_at
  end
end
