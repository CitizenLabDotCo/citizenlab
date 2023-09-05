# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20230904081207)
class AddLocaleToIdeaImports < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_imports, :locale, :string
  end
end
