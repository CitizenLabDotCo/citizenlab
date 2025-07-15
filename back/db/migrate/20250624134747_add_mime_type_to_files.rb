# frozen_string_literal: true

class AddMimeTypeToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :mime_type, :string
    add_index :files, :mime_type
  end
end
