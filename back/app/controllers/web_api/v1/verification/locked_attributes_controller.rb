# frozen_string_literal: true

module WebApi
  module V1
    module Verification
      class LockedAttributesController < ApplicationController
        skip_after_action :verify_policy_scoped

        def index
          ver_service = ::Verification::VerificationService.new

          @locked_attributes = ver_service.locked_attributes(current_user)
            .map do |name|
              ::Verification::LockedAttribute.new(name)
            end

          @locked_attributes = Kaminari.paginate_array(@locked_attributes)
          @locked_attributes = paginate @locked_attributes

          render json: linked_json(
            @locked_attributes,
            WebApi::V1::Verification::LockedAttributeSerializer,
            params: jsonapi_serializer_params
          )
        end
      end
    end
  end
end
