# frozen_string_literal: true

class AddExtraInfoToIdeaImports < ActiveRecord::Migration[7.1]
  def change
    add_column :idea_imports, :extra_info, :jsonb, default: {}
  end
end
