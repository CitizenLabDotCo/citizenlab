# frozen_string_literal: true

# Records what a client last called the API with, so integrations can be
# identified without reaching for logs.
class AddLastUserAgentToPublicApiApiClients < ActiveRecord::Migration[7.2]
  def change
    add_column :public_api_api_clients, :last_user_agent, :string
  end
end
