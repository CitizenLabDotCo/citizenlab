# frozen_string_literal: true

class AddLocaleToIdeaImports < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_imports, :locale, :string
  end
end
