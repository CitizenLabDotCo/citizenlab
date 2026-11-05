# frozen_string_literal: true

class AddVisitorHashToIdeaExposures < ActiveRecord::Migration[7.2]
  # Disable transaction to allow concurrent index creation
  disable_ddl_transaction!

  def change
    add_column :idea_exposures, :visitor_hash, :string
    add_index :idea_exposures, :visitor_hash, algorithm: :concurrently

    # Removing NOT NULL (allowing nulls) is safe - just a catalog update, no table scan.
    # Only adding NOT NULL is dangerous as it requires scanning all rows.
    safety_assured { change_column_null :idea_exposures, :user_id, true }
  end
end
