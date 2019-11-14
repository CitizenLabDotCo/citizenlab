module Verification
  module WebApi
    module V1
      class LockedAttributesController < VerificationController

        skip_after_action :verify_policy_scoped

        def index
          ver_service = VerificationService.new

          @locked_attributes = ver_service.locked_attributes(current_user)
            .map do |name|
              LockedAttribute.new(name)
            end

          @locked_attributes = Kaminari.paginate_array(@locked_attributes)
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))

          render json: linked_json(
            @locked_attributes,
            WebApi::V1::LockedAttributeSerializer,
            params: fastjson_params
          )
        end

        private

        def secure_controller?
          true
        end
      end
    end
  end
end