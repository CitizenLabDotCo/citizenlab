class AddUniqueLowerEmailIndexToUsers < ActiveRecord::Migration[5.1]
  def change
    execute <<-SQL
      CREATE UNIQUE INDEX users_unique_lower_email_idx
      ON users (lower(email));
    SQL
  end
end
