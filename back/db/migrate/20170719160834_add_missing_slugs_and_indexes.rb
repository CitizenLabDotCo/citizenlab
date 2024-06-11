# frozen_string_literal: true

class AddMissingSlugsAndIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index :projects, :slug, unique: true

    remove_index :pages, :slug
    add_index :pages, :slug, unique: true

    remove_index :users, :slug
    add_index :users, :slug, unique: true

    add_column :ideas, :slug, :string

    change_column_null :ideas, :slug, false
    add_index :ideas, :slug, unique: true
  end
end
