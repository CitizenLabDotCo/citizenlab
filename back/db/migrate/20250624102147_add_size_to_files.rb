# frozen_string_literal: true

class AddSizeToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :files, :size, :integer, comment: 'in bytes'
    add_index :files, :size

    change_column_comment :files, :uploader_id, 'the user who uploaded the file'
  end
end
