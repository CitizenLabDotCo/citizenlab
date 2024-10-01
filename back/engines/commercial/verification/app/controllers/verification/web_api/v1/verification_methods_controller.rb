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

        def first_enabled
          method = VerificationService.new.first_method_enabled
          authorize method, policy_class: VerificationMethodPolicy
          respond_with(method)
        end

        def first_enabled_for_verified_actions
          method = VerificationService.new.first_method_enabled_for_verified_actions
          authorize method, policy_class: VerificationMethodPolicy
          respond_with(method)
        end

        private

        def respond_with(method)
          if method.nil?
            head :no_content
          else
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
end
