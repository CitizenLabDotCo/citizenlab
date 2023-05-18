# frozen_string_literal: true

class AddAnonymousColumnsToInitiatives < ActiveRecord::Migration[6.1]
  def change
    add_column :initiatives, :author_hash, :string, null: true, default: nil
    add_column :initiatives, :anonymous, :boolean, null: false, default: false
  end
end
