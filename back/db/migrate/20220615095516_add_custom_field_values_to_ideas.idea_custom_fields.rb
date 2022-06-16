# frozen_string_literal: true

# This migration comes from idea_custom_fields (originally 20220325093826)

class AddCustomFieldValuesToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :custom_field_values, :jsonb, default: {}, null: false
  end
end
