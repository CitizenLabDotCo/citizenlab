# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20250807130105)
class AddTypeToProjectImports < ActiveRecord::Migration[7.1]
  def change
    add_column :project_imports, :import_type, :string
  end
end
