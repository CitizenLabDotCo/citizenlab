# frozen_string_literal: true

class AddPhoneNumberToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :phone_number, :string
    add_column :users, :phone_number_verified_at, :datetime
    add_index :users, :phone_number
  end
end
