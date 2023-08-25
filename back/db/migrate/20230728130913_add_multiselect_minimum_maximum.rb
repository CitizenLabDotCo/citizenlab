# frozen_string_literal: true

class AddMultiselectMinimumMaximum < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_fields, :select_count_enabled, :boolean, null: false, default: false
    add_column :custom_fields, :maximum_select_count, :integer
    add_column :custom_fields, :minimum_select_count, :integer
  end
end
