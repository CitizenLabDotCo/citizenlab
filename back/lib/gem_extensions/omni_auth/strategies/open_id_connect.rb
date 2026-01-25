# frozen_string_literal: true

module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnect
        # Patch +OmniAuth::Strategies::OpenIdConnect+

        # Patched to allow dynamic specification of the issuer.
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

        # Patched to clear memoized state at the start of each phase (hoplr).
        # The OmniAuth strategy is a singleton shared across all requests/tenants.
        # Without this, cached values from one tenant would be incorrectly used for another,
        # causing invalid_grant errors (wrong client credentials) and KidNotFound errors (wrong JWKS).
        def callback_phase
          return super unless name == 'hoplr'

          clear_memoized_state!
          super
        end

        def request_phase
          return super unless name == 'hoplr'

          clear_memoized_state!
          super
        end

        # Override discover! to store discovered endpoints in env for Hoplr.
        # This ensures we capture the correct endpoints before options can be overwritten.
        def discover!
          return super unless name == 'hoplr'

          super # Let parent update options.client_options with discovered endpoints

          # Immediately snapshot the full client_options to env (includes discovered endpoints)
          env['omniauth.hoplr.full_client_options'] = client_options.dup
        end

        # Override client to use REQUEST-LOCAL memoization for Hoplr.
        # Uses the snapshotted client_options from discover! to avoid race conditions.
        def client
          return super unless name == 'hoplr'

          env['omniauth.oidc.client'] ||= begin
            # Use full_client_options if available (after discover!), otherwise fall back
            opts = env['omniauth.hoplr.full_client_options'] || client_options
            ::OpenIDConnect::Client.new(opts)
          end
        end

        # Override config to use REQUEST-LOCAL memoization for Hoplr.
        def config
          return super unless name == 'hoplr'

          env['omniauth.oidc.config'] ||= begin
            # Use issuer from env (set by setup proc) to avoid race conditions
            issuer_val = env['omniauth.hoplr.issuer'] || options.issuer
            ::OpenIDConnect::Discovery::Provider::Config.discover!(issuer_val)
          end
        end

        # Override public_key to use REQUEST-LOCAL memoization for Hoplr.
        def public_key
          return super unless name == 'hoplr'

          env['omniauth.oidc.public_key'] ||= config.jwks
        end

        # Patched to retry with refreshed JWKS when key rotation causes KidNotFound errors.
        # This fixes intermittent authentication failures when the identity provider rotates
        # their signing keys and the cached JWKS doesn't contain the new key ID.
        def decode_id_token(id_token)
          super
        rescue JSON::JWK::Set::KidNotFound => e
          Rails.logger.warn("[OmniAuth OpenIDConnect] KidNotFound error for provider '#{name}', refreshing JWKS cache and retrying: #{e.message}")

          # Clear cached JWKS values and retry once
          # For Hoplr, we use env-based caching; for others, instance variables
          if name == 'hoplr'
            env.delete('omniauth.oidc.config')
            env.delete('omniauth.oidc.public_key')
          else
            @config = nil
            @public_key = nil
          end

          super
        end

        private

        # Clears all memoized instance variables that are tenant-specific.
        # This ensures each request uses fresh values from the current tenant's configuration.
        def clear_memoized_state!
          @client = nil         # OpenIDConnect client (client_id, secret, redirect_uri)
          @config = nil         # Discovery config (issuer-specific endpoints)
          @public_key = nil     # JWKS keyset (issuer-specific signing keys)
          @access_token = nil   # Token response from current auth flow
          @user_info = nil      # User info from current auth flow
        end
      end
    end
  end
end
