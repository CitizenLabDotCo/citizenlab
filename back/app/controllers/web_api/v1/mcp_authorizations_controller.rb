# frozen_string_literal: true

module WebApi
  module V1
    # Lists and revokes the current user's MCP client authorizations (Doorkeeper
    # access tokens), grouped by client application — one row per client.
    #
    # Self-scoped: every query goes through `current_user`, so a user only ever
    # sees or revokes their own authorizations. A guessed/forged application id in
    # #destroy can never touch another user's tokens (no IDOR).
    #
    # Authorizations are a synthesized grouping (not an AR model), so we render the
    # JSON:API envelope by hand rather than via a serializer — mirroring the sibling
    # OauthAuthorizationsController. Pundit's verify_* hooks are skipped because the
    # scoping is done explicitly here, not through a policy.
    class McpAuthorizationsController < ApplicationController
      skip_after_action :verify_authorized, only: :destroy
      skip_after_action :verify_policy_scoped, only: :index

      # GET /web_api/v1/mcp_authorizations
      def index
        authorizations = current_user.access_tokens
          .where(revoked_at: nil)
          .includes(:application)
          .select { |token| token.scopes.to_a.include?('mcp:access') }
          .group_by(&:application_id)
          .map { |_application_id, tokens| serialize_authorization(tokens) }

        render json: { data: authorizations }
      end

      # DELETE /web_api/v1/mcp_authorizations/:id  (:id = application_id)
      # Revokes every non-revoked token AND grant the current user holds for this
      # client, fully severing the client's access. Never deletes the shared
      # Doorkeeper::Application (other users may have authorized the same client).
      def destroy
        current_user.access_tokens
          .where(application_id: params[:id], revoked_at: nil)
          .each(&:revoke)
        current_user.access_grants
          .where(application_id: params[:id], revoked_at: nil)
          .each(&:revoke)

        head :no_content
      end

      private

      def serialize_authorization(tokens)
        application = tokens.first.application
        {
          id: application.id,
          type: 'mcp_authorization',
          attributes: {
            client_name: application.name,
            client_id: application.uid,
            authorized_at: tokens.map(&:created_at).min,
            status: 'active'
          }
        }
      end
    end
  end
end
