# frozen_string_literal: true

class AddUniqueIndexOnUsersPhone < ActiveRecord::Migration[7.2]
  def change
    add_index :users, :phone,
      unique: true,
      where: 'phone IS NOT NULL'
  end
end
