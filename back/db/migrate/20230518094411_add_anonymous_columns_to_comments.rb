# frozen_string_literal: true

class AddAnonymousColumnsToComments < ActiveRecord::Migration[6.1]
  def change
    add_column :comments, :author_hash, :string, null: true, default: nil
    add_column :comments, :anonymous, :boolean, null: false, default: false
  end
end
