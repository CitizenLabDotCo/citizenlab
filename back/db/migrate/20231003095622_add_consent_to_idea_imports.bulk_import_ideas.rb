# frozen_string_literal: true

# This migration comes from bulk_import_ideas (originally 20231003104116)
class AddConsentToIdeaImports < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_imports, :user_consent, :boolean
    add_column :idea_imports, :content_changes, :jsonb, default: {}
  end
end
