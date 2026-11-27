# frozen_string_literal: true

class DropCustomFieldValuesColumns < ActiveRecord::Migration[7.2]
  def change
    # Version 3 selected ideas.*, which made the view depend on every column of ideas.
    replace_view :reporting_contributions, version: 4, revert_to_version: 3

    safety_assured do
      remove_column :ideas, :custom_field_values, :jsonb, default: {}, null: false
      remove_column :users, :custom_field_values, :jsonb, default: {}
    end
  end
end
