# frozen_string_literal: true

module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnect
        # Patch +OmniAuth::Strategies::OpenIdConnect+ to allow dynamic specification of the issuer.
        def issuer
          return options.issuer.call(env) if options.issuer.respond_to?(:call)

          super
        end

        # Patched to allow openid_connect without a userinfo endpoint (id_austria)
        def user_info
          return super unless name == 'id_austria'
          return @user_info if @user_info

          if access_token.id_token
            decoded = decode_id_token(access_token.id_token).raw_attributes
            @user_info = ::OpenIDConnect::ResponseObject::UserInfo.new decoded
          end
        end

        # Patched to retry with refreshed JWKS when key rotation causes KidNotFound errors.
        # This fixes intermittent authentication failures when the identity provider rotates
        # their signing keys and the cached JWKS doesn't contain the new key ID.
        def decode_id_token(id_token)
          super
        rescue JSON::JWK::Set::KidNotFound => e
          Rails.logger.warn("[OmniAuth OpenIDConnect] KidNotFound error for provider '#{name}', refreshing JWKS cache and retrying: #{e.message}")

          # Clear the cached discovery config to force a fresh JWKS fetch
          @config = nil

          # Retry once with the refreshed JWKS
          super
        end
      end
    end
  end
end
