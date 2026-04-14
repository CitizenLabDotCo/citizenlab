# frozen_string_literal: true

module GVPlugins
  class PluginApiTokenService
    CLIENT_NAME_PREFIX = 'plugin:'

    def mint_jwt(plugin_name)
      api_client = find_or_create_api_client(plugin_name)
      AuthToken::AuthToken.new(payload: api_client.to_token_payload).token
    end

    private

    def find_or_create_api_client(plugin_name)
      name = "#{CLIENT_NAME_PREFIX}#{plugin_name}"
      PublicApi::ApiClient.find_or_create_by!(name: name)
    end
  end
end
