# frozen_string_literal: true

class AddParentToIdeaImportFiles < ActiveRecord::Migration[7.0]
  change_table :idea_import_files do |t|
    t.references :parent, type: :uuid, foreign_key: { to_table: :idea_import_files }, index: true, null: true
  end
end
