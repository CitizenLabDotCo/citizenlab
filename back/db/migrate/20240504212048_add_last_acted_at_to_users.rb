class AddLastActedAtToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :last_acted_at, :datetime
  end
end
