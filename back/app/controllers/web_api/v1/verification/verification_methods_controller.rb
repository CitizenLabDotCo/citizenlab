# frozen_string_literal: true

module WebApi
  module V1
    module Verification
      class VerificationMethodsController < ApplicationController
        skip_before_action :authenticate_user

        def index
          vm_service = ::Verification::VerificationService.new
          @verification_methods = vm_service.active_methods(AppConfiguration.instance)
          @verification_methods = policy_scope(@verification_methods, policy_scope_class: ::Verification::VerificationMethodPolicy::Scope)
          @verification_methods = paginate Kaminari.paginate_array(@verification_methods)

          render json: linked_json(
            @verification_methods,
            WebApi::V1::Verification::VerificationMethodSerializer,
            params: jsonapi_serializer_params
          )
        end

        def first_enabled
          method = ::Verification::VerificationService.new.first_method_enabled
          authorize method, policy_class: ::Verification::VerificationMethodPolicy
          respond_with(method)
        end

        def first_enabled_for_verified_actions
          method = ::Verification::VerificationService.new.first_method_enabled_for_verified_actions
          authorize method, policy_class: ::Verification::VerificationMethodPolicy
          respond_with(method)
        end

        private

        def respond_with(method)
          if method.nil?
            head :no_content
          else
            render json: WebApi::V1::Verification::VerificationMethodSerializer
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
