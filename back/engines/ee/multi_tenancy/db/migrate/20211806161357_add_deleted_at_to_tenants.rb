# frozen_string_literal: true

class AddDeletedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :deleted_at, :datetime, index: true, null: true, default: nil
  end
end
