# frozen_string_literal: true

class AddOtherOptionToCustomFields < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_fields, :other_option, :boolean, default: false, null: false
  end
end
