# frozen_string_literal: true

class RemoveAccidentalImportColumns < ActiveRecord::Migration[7.1]
  def change
    safety_assured do
      remove_column :project_imports, :string, :string if column_exists?(:project_imports, :string)
      remove_column :idea_imports, :string, :string if column_exists?(:idea_imports, :string)
      remove_column :idea_imports, :required, :boolean, default: false if column_exists?(:idea_imports, :required)
    end
  end
end
