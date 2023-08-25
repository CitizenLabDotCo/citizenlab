# frozen_string_literal: true

module Verification
  module VerificationMethod
    # @return [Hash, nil]
    def config
      AppConfiguration.instance
        .settings('verification', 'verification_methods')
        .find { |method| method['name'] == name }
        .to_h # if find returns nil
        .except('allowed', 'enabled')
        .symbolize_keys
        .presence
    end

    def fetch_user(request)
      # `token` can be unusual here. See different `fetch_token` implementations.
      token = fetch_token(request)
      AuthToken::AuthToken.new(token: token).entity_for(::User)
    end

    def fetch_token(request)
      request.env['omniauth.params']['token']
    end
  end
end
