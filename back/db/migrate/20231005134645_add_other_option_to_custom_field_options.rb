# frozen_string_literal: true

class AddOtherOptionToCustomFieldOptions < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_field_options, :other_option, :boolean, default: false, null: false
  end
end
