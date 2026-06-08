# frozen_string_literal: true

module WebApi
  module V1
    class IdMethodsController < ApplicationController
      skip_before_action :authenticate_user

      def index
        id_method_service = ::IdMethodService.new
        @id_methods = id_method_service.configured_methods(AppConfiguration.instance)
        @id_methods = policy_scope(@id_methods, policy_scope_class: IdMethodPolicy::Scope)
        @id_methods = paginate Kaminari.paginate_array(@id_methods)

        render json: linked_json(
          @id_methods,
          WebApi::V1::IdMethodSerializer,
          params: jsonapi_serializer_params
        )
      end

      def first_enabled_verification_method
        method = ::Verification::VerificationService.new.first_method_enabled
        authorize method, policy_class: IdMethodPolicy
        respond_with(method)
      end

      def first_enabled_for_verified_actions
        method = ::Verification::VerificationService.new.first_method_enabled_for_verified_actions
        authorize method, policy_class: IdMethodPolicy
        respond_with(method)
      end

      private

      def respond_with(method)
        if method.nil?
          head :no_content
        else
          render json: WebApi::V1::IdMethodSerializer
            .new(
              method,
              params: jsonapi_serializer_params
            ).serializable_hash
        end
      end
    end
  end
end
