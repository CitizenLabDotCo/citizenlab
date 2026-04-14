# frozen_string_literal: true

# This migration comes from public_api (originally 20260414120000)
class AddUniqueIndexOnApiClientName < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :public_api_api_clients, :name, unique: true, where: 'name IS NOT NULL', algorithm: :concurrently
  end
end
