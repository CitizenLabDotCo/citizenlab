class RenameUsersLastActedAtToLastActiveAt < ActiveRecord::Migration[7.0]
  def change
    rename_column :users, :last_acted_at, :last_active_at
  end
end
