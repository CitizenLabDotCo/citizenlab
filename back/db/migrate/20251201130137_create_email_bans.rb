# frozen_string_literal: true

class CreateEmailBans < ActiveRecord::Migration[7.1]
  def change
    create_table :email_bans, id: :uuid do |t|
      t.string :normalized_email_hash, null: false, index: { unique: true }
      t.text :reason
      t.references :banned_by, type: :uuid, foreign_key: { to_table: :users }, null: true
      t.datetime :created_at, null: false
    end
  end
end
