class AddLastActedAtAndLastLoginAtToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :last_login_at, :datetime
    add_column :users, :last_acted_at, :datetime
  end
end
