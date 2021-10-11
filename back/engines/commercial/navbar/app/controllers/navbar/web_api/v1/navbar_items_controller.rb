module Navbar
  class WebApi::V1::NavbarItemsController < ApplicationController
    after_action :verify_authorized

    rescue_from ActionController::ParameterMissing do |exception|
      render json: { error: exception.message }, status: :unprocessable_entity
    end

    def update
      navbar_item = NavbarItem.find(params.require(:id))
      authorize(navbar_item)

      ::Navbar::UpdateNavbarItemService.new(navbar_item, navbar_item_params.to_h).call

      if navbar_item.errors.empty? && navbar_item.page.errors.empty?
        serializer = ::WebApi::V1::NavbarItemSerializer.new(navbar_item.reload, params: fastjson_params, include: [:page])
        render json: serializer.serialized_json, status: :ok
      else
        errors = navbar_item.errors.details.deep_dup
        errors.merge!(navbar_item.page.errors.details)
        render json: { errors: errors }, status: :unprocessable_entity
      end
    end

    private

    def navbar_item_params
      params.require(:navbar_item).permit(
        :visible,
        :ordering,
        title_multiloc: CL2_SUPPORTED_LOCALES,
        page: [
          :slug,
          :publication_status,
          title_multiloc: CL2_SUPPORTED_LOCALES,
          body_multiloc: CL2_SUPPORTED_LOCALES
        ]
      )
    end
  end
end
