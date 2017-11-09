class RemoveServicesFromUsers < ActiveRecord::Migration[5.1]
  def change
    remove_column :users, :services, :jsonb
  end
end
