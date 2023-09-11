# frozen_string_literal: true

class AddPageNumToIdeaImportFiles < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_import_files, :num_pages, :integer, default: 0
  end
end
