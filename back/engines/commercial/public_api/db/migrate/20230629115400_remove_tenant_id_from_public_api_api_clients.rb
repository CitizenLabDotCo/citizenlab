# frozen_string_literal: true

class RemoveTenantIdFromPublicApiApiClients < ActiveRecord::Migration[7.0]
  def change
    remove_column :public_api_api_clients, :tenant_id
  end
end
