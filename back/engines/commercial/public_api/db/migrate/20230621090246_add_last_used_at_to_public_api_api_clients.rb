# frozen_string_literal: true

class AddLastUsedAtToPublicApiApiClients < ActiveRecord::Migration[7.0]
  def change
    add_column :public_api_api_clients, :last_used_at, :datetime
  end
end
