class AddCl1MigratedToUsers < ActiveRecord::Migration[5.1]
  def change
  	add_column :users, :cl1_migrated, :boolean, :default => false
  end
end
