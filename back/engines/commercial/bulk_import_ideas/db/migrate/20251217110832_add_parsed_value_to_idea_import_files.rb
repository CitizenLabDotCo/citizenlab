# frozen_string_literal: true

class AddParsedValueToIdeaImportFiles < ActiveRecord::Migration[7.1]
  def change
    add_column :idea_import_files, :parsed_value, :jsonb, default: {}
  end
end
