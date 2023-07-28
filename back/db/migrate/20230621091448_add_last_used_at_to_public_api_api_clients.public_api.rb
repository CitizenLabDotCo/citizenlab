# frozen_string_literal: true

# This migration comes from public_api (originally 20230621090246)
class AddLastUsedAtToPublicApiApiClients < ActiveRecord::Migration[7.0]
  def change
    add_column :public_api_api_clients, :last_used_at, :datetime
  end
end
