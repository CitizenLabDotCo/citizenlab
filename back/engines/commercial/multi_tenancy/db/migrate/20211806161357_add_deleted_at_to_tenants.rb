# frozen_string_literal: true

class AddDeletedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :deleted_at, :datetime, null: true, default: nil
    add_index :tenants, :deleted_at
  end
end
