# frozen_string_literal: true

class AddAnonymousToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :anonymous, :boolean, null: false, default: false
  end
end
