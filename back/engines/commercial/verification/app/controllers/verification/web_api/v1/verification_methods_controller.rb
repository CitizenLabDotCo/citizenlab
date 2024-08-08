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

        def first_method_enabled_for_verified_actions
          method = VerificationService.new.first_method_enabled_for_verified_actions
          :send_not_found if method.nil?

          authorize method, policy_class: VerificationMethodPolicy
          render json: WebApi::V1::VerificationMethodSerializer
            .new(
              method,
              params: jsonapi_serializer_params
            ).serializable_hash
        end
      end
    end
  end
end
