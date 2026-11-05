# frozen_string_literal: true

module McpServer
  module WebApi
    module V1
      # RFC 6749 authorization endpoint, served as JSON for the SPA consent screen.
      # Replaces Doorkeeper's HTML consent page: the SPA reads the pending
      # authorization with #show, then approves (#create) or denies (#destroy).
      #
      # The resource owner is the JWT `current_user` (the SPA's normal bearer
      # token), not Doorkeeper's cookie-based `resource_owner_authenticator`.
      # `authenticate_user` (inherited, not skipped) guarantees a logged-in user,
      # so `current_resource_owner` is never nil when minting a grant.
      #
      # Drives Doorkeeper's OAuth objects directly. `Doorkeeper::Server` and the
      # authorization strategy reach back into this controller via
      # `context.send(:current_resource_owner)` and `context.send(:pre_auth)`.
      class OauthAuthorizationsController < ::ApplicationController
        skip_after_action :verify_authorized

        PRE_AUTH_PARAMS = %i[
          client_id code_challenge code_challenge_method
          response_type response_mode redirect_uri scope state
        ].freeze

        # GET /web_api/v1/oauth_authorization
        def show
          if pre_auth.authorizable?
            render json: raw_json({
              client_id: pre_auth.client.uid,
              client_name: pre_auth.client.name,
              scopes: pre_auth.scopes.map(&:to_s),
              redirect_uri: pre_auth.redirect_uri,
              params: echoed_params
            }, type: 'oauth_authorization')
          else
            render_pre_auth_error
          end
        end

        # POST /web_api/v1/oauth_authorization (user approved)
        def create
          return render_pre_auth_error unless pre_auth.authorizable?

          render_authorization(strategy.authorize)
        end

        # Denial (the user clicking "Deny") needs no server call: it persists nothing
        # and only redirects the client back with `error=access_denied`. The SPA builds
        # that redirect from the already-validated redirect_uri returned by #show.

        private

        # Echo the exact OAuth params back so the SPA re-submits them verbatim on approve.
        def echoed_params
          {
            client_id: pre_auth.client.uid,
            response_type: pre_auth.response_type,
            redirect_uri: pre_auth.redirect_uri,
            scope: pre_auth.scope,
            state: pre_auth.state,
            code_challenge: pre_auth.code_challenge,
            code_challenge_method: pre_auth.code_challenge_method
          }.compact
        end

        # Let Doorkeeper build the redirect URI (handles query vs fragment, state
        # omission and OOB URIs) instead of assembling it by hand.
        def render_authorization(auth)
          if auth.redirectable?
            render json: raw_json({ redirect_uri: auth.redirect_uri }, type: 'oauth_authorization')
          else
            render json: auth.body, status: auth.status
          end
        end

        def render_pre_auth_error
          render json: pre_auth.error_response.body, status: pre_auth.error_response.status
        end

        # Reached by Doorkeeper::Server#current_resource_owner via context.send.
        def current_resource_owner
          current_user
        end

        # Reached by Doorkeeper::Request::Code#pre_auth via server.context.send.
        # Must be the same memoized instance validated in the action so the strategy
        # mints a grant against the authorization we actually checked.
        def pre_auth
          @pre_auth ||= Doorkeeper::OAuth::PreAuthorization.new(
            Doorkeeper.configuration,
            pre_auth_params,
            current_resource_owner
          )
        end

        def server
          @server ||= Doorkeeper::Server.new(self)
        end

        def strategy
          @strategy ||= server.authorization_request(pre_auth.response_type)
        end

        # slice before permit so unexpected query params never trip
        # ActionController::UnpermittedParameters (mirrors Doorkeeper's own controller).
        def pre_auth_params
          params.slice(*PRE_AUTH_PARAMS).permit(*PRE_AUTH_PARAMS)
        end
      end
    end
  end
end
