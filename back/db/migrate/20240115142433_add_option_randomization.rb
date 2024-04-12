# frozen_string_literal: true

class AddOptionRandomization < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_fields, :random_option_ordering, :boolean, default: false, null: false
  end
end
