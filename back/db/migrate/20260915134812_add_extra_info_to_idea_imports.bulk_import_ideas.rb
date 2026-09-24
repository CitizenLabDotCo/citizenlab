# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20260915134811)
class AddExtraInfoToIdeaImports < ActiveRecord::Migration[7.1]
  def change
    add_column :idea_imports, :extra_info, :jsonb, default: {}
  end
end
