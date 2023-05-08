# frozen_string_literal: true

class AddNewEmailToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :new_email, :string, null: true, default: nil
  end
end
