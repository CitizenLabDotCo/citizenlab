# frozen_string_literal: true

class CreateCustomPageFiles < ActiveRecord::Migration[6.1]
  def change
    create_table :custom_page_files, id: :uuid do |t|
      t.references :custom_page, foreign_key: true, type: :uuid, index: true
      t.string :file
      t.string :name
      t.integer :ordering

      t.timestamps
    end
  end
end
