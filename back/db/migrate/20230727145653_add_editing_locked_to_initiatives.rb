# frozen_string_literal: true

class AddEditingLockedToInitiatives < ActiveRecord::Migration[7.0]
  def change
    add_column :initiatives, :editing_locked, :boolean, default: false, null: false
  end
end
