# frozen_string_literal: true

class AddAnonymousColumnsToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :author_hash, :string, null: true, default: nil
    add_column :ideas, :anonymous, :boolean, null: false, default: false
  end
end
