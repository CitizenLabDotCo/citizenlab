# frozen_string_literal: true

class AddCreationFinalizedAtToTenants < ActiveRecord::Migration[6.1]
  def change
    add_column :tenants, :creation_finalized_at, :datetime, null: true, default: nil
    add_index :tenants, :creation_finalized_at
  end
end
