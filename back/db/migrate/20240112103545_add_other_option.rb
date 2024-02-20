# frozen_string_literal: true

class AddOtherOption < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_field_options, :other, :boolean, default: false, null: false
  end
end
