class RemoveCl1MigratedFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :cl1_migrated
  end
end
