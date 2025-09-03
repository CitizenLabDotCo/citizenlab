# frozen_string_literal: true

class AddImportedToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :imported, :boolean, default: false, null: false
  end
end
