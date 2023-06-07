# frozen_string_literal: true

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
          @locked_attributes = paginate @locked_attributes

          render json: linked_json(
            @locked_attributes,
            WebApi::V1::LockedAttributeSerializer,
            params: jsonapi_serializer_params
          )
        end
      end
    end
  end
end
