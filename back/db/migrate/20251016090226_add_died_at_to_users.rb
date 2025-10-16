class AddDiedAtToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :died_at, :datetime
  end
end
