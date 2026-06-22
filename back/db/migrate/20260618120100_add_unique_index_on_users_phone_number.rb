# frozen_string_literal: true

class AddUniqueIndexOnUsersPhoneNumber < ActiveRecord::Migration[7.2]
  def change
    add_index :users, :phone_number,
      unique: true,
      where: 'phone_number IS NOT NULL'
  end
end
