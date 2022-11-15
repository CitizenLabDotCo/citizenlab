# frozen_string_literal: true

class AddLogicToCustomFields < ActiveRecord::Migration[6.1]
  def change
    add_column :custom_fields, :logic, :jsonb, default: {}, null: false
  end
end
