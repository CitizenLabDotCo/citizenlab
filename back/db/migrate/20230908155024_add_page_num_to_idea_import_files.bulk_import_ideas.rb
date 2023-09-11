# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20230908164107)
class AddPageNumToIdeaImportFiles < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_import_files, :num_pages, :integer, default: 0
  end
end
