# frozen_string_literal: true

class AddCharacterLimitsToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_fields, :min_characters, :integer
    add_column :custom_fields, :max_characters, :integer
  end
end
