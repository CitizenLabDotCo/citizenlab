# frozen_string_literal: true

class AddCategoryToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :category, :string, null: false, default: 'other'
    add_index :files, :category
  end
end
