# frozen_string_literal: true

class AddShowAsFilterToCustomFields < ActiveRecord::Migration[7.2]
  def change
    add_column :custom_fields, :show_as_filter, :boolean, default: false, null: false
  end
end
