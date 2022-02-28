# This migration comes from multi_tenancy_engine (originally 20220228154307)
class AddFinalizedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :finalized_at, :datetime, null: true, default: nil
    add_index :tenants, :finalized_at
  end
end
