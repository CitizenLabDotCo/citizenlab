class AddVerifiedToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :verified, :boolean, null: false, default: false
  end
end
