# frozen_string_literal: true

# This migration comes from public_api (originally 20230629115400)
class RemoveTenantIdFromPublicApiApiClients < ActiveRecord::Migration[7.0]
  def change
    remove_column :public_api_api_clients, :tenant_id
  end
end
