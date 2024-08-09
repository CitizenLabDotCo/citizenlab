# frozen_string_literal: true

class AddDropdownLayoutSelectFields < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_fields, :dropdown_layout, :boolean, default: false, null: false
  end
end
