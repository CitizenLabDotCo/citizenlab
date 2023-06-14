# frozen_string_literal: true

module Verification
  module WebApi
    module V1
      class VerificationMethodsController < VerificationController
        skip_before_action :authenticate_user

        def index
          vm_service = VerificationService.new

          @verification_methods = vm_service.active_methods(AppConfiguration.instance)
          @verification_methods = policy_scope(@verification_methods, policy_scope_class: VerificationMethodPolicy::Scope)
          @verification_methods = paginate Kaminari.paginate_array(@verification_methods)

          render json: linked_json(
            @verification_methods,
            WebApi::V1::VerificationMethodSerializer,
            params: jsonapi_serializer_params
          )
        end
      end
    end
  end
end
