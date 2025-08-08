# frozen_string_literal: true

class AddTypeToProjectImports < ActiveRecord::Migration[7.1]
  def change
    add_column :project_imports, :import_type, :string
  end
end
