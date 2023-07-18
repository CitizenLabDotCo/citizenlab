# frozen_string_literal: true

class CreateFollowers < ActiveRecord::Migration[7.0]
  def change
    create_table :followers, id: :uuid do |t|
      t.string :followable_type, null: false
      t.uuid :followable_id, null: false
      t.references :user, foreign_key: true, type: :uuid, null: false

      t.timestamps
      t.index %i[followable_id followable_type user_id], unique: true, name: :index_followers_followable_type_id_user_id
    end
  end
end
