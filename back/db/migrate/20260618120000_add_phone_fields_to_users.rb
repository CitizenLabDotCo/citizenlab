# frozen_string_literal: true

class AddPhoneFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :phone, :string
    add_column :users, :new_phone, :string
    add_column :users, :phone_confirmed_at, :datetime
  end
end
