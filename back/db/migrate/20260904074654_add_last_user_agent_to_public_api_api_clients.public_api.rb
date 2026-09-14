# frozen_string_literal: true

# This migration comes from public_api (originally 20260904090000)
# Records what a client last called the API with, so we can tell a Power BI
# refresh (Power Query identifies itself as Microsoft.Data.Mashup) from a custom
# integration without reaching for logs.
class AddLastUserAgentToPublicApiApiClients < ActiveRecord::Migration[7.2]
  def change
    add_column :public_api_api_clients, :last_user_agent, :string
  end
end
