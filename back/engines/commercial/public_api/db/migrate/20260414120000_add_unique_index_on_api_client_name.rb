# frozen_string_literal: true

class AddUniqueIndexOnApiClientName < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :public_api_api_clients, :name, unique: true, where: 'name IS NOT NULL', algorithm: :concurrently
  end
end
