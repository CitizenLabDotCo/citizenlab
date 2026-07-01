# frozen_string_literal: true

class AddParentIdToNavBarItems < ActiveRecord::Migration[7.2]
  def change
    add_column :nav_bar_items, :parent_id, :uuid
    add_foreign_key :nav_bar_items, :nav_bar_items, column: :parent_id, validate: false
  end
end
