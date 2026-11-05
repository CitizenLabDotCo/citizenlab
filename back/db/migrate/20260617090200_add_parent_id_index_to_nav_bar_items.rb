# frozen_string_literal: true

class AddParentIdIndexToNavBarItems < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    add_index :nav_bar_items, :parent_id, algorithm: :concurrently
  end
end
