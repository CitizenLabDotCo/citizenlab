class AddInitializationFinishedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :initialization_finished_at, :datetime, null: true, default: nil
    add_index :tenants, :initialization_finished_at
  end
end
