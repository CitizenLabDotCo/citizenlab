# frozen_string_literal: true

module McpServer
  module WebApi
    module V1
      class McpAuthorizationsController < ::ApplicationController
        def index
          authorizations = policy_scope(Doorkeeper::Application)

          render json: WebApi::V1::McpAuthorizationSerializer.new(
            authorizations, params: jsonapi_serializer_params
          ).serializable_hash
        end

        # Revoke the user's tokens/grants rather than destroying the application,
        # which is shared (other users may have authorized the same client).
        def destroy
          application = Doorkeeper::Application.find(params[:id])
          authorize application

          current_user.access_tokens
            .where(application_id: application.id, revoked_at: nil)
            .each(&:revoke)
          current_user.access_grants
            .where(application_id: application.id, revoked_at: nil)
            .each(&:revoke)

          head :no_content
        end
      end
    end
  end
end
