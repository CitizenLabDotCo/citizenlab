class AddTokenExpiryKeyToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :token_expiry_key, :string
    add_index :users, :token_expiry_key
  end
end
