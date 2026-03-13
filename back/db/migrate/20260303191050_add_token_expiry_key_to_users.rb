class AddTokenExpiryKeyToUsers < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  def change
    add_column :users, :token_expiry_key, :string
    add_index :users, :token_expiry_key, algorithm: :concurrently
  end
end
