# frozen_string_literal: true

class ValidateAddParentIdToNavBarItems < ActiveRecord::Migration[7.2]
  def change
    validate_foreign_key :nav_bar_items, :nav_bar_items, column: :parent_id
  end
end
