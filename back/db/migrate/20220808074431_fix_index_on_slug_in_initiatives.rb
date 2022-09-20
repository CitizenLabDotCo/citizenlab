# frozen_string_literal: true

class FixIndexOnSlugInInitiatives < ActiveRecord::Migration[6.1]
  def up
    remove_index :initiatives, :slug
    add_index :initiatives, :slug, unique: true
  end

  def down
    remove_index :initiatives, :slug
    add_index :initiatives, :slug
  end
end
