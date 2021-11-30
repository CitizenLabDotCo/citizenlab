# frozen_string_literal: true
# This migration comes from multi_tenancy (originally 20211806161357)

class AddDeletedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :deleted_at, :datetime, index: true, null: true, default: nil
  end
end
