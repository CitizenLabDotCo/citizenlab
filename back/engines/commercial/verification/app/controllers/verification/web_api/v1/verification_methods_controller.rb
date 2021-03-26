module Verification
  module WebApi
    module V1
      class VerificationMethodsController < VerificationController

        def index
          vm_service = VerificationService.new

          @verification_methods = vm_service.active_methods(AppConfiguration.instance)
          @verification_methods = policy_scope(@verification_methods, policy_scope_class: VerificationMethodPolicy::Scope)
          @verification_methods = Kaminari.paginate_array(@verification_methods)
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))

          render json: linked_json(
            @verification_methods,
            WebApi::V1::VerificationMethodSerializer,
            params: fastjson_params
          )
        end

        private

        def secure_controller?
          false
        end
      end
    end
  end
end