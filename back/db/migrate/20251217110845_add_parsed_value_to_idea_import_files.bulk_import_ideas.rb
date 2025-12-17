# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20251217110832)
class AddParsedValueToIdeaImportFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :idea_import_files, :parsed_value, :jsonb, default: {}
  end
end
