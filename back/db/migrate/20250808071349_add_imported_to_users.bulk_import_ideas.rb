# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20250809081214)
class AddImportedToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :imported, :boolean, default: false, null: false
  end
end
