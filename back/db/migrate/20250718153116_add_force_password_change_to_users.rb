# frozen_string_literal: true

class AddForcePasswordChangeToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :force_password_change, :boolean, default: false, null: false
  end
end
