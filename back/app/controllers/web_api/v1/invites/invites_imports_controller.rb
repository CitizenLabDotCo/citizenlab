module WebApi
  module V1
    module Invites
      class InvitesImportsController < ApplicationController
        skip_after_action :verify_policy_scoped

        def show
          import = InvitesImport.find(params[:id])
          authorize :invite, :create?

          render json: WebApi::V1::Invites::InvitesImportSerializer.new(
            import,
            params: jsonapi_serializer_params
          ).serializable_hash
        end
      end
    end
  end
end
