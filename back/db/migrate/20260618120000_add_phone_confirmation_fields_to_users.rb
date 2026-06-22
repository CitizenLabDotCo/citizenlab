# frozen_string_literal: true

class AddPhoneConfirmationFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :new_phone_number, :string
    add_column :users, :phone_number_confirmed_at, :datetime
  end
end
