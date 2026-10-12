# frozen_string_literal: true

class AddRolesIndexToUsers < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  # The role scopes in UserRoles and UserRoleService all filter with jsonb
  # containment (`roles @> ...`). Without a GIN index those are sequential
  # scans of the whole users table, which on a 200k-user tenant costs ~150ms
  # per call — paid per notification in the moderator fan-out.
  def change
    add_index :users, :roles, using: :gin, algorithm: :concurrently
  end
end
