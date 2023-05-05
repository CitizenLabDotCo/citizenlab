# frozen_string_literal: true

class AddUniqueCodeToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :unique_code, :string, null: true, default: nil
    add_index :users, :unique_code, unique: true
    add_column :projects, :qr_code, :string, null: true, default: nil
  end
end
