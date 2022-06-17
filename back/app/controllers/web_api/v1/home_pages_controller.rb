# frozen_string_literal: true

class WebApi::V1::HomePagesController < ApplicationController
  before_action :set_home_page
  skip_before_action :authenticate_user, only: %i[index show]

  def show
    render json: WebApi::V1::HomePageSerializer.new(@homepage, params: fastjson_params).serialized_json
  end

  def update
    @homepage.assign_attributes home_page_params
    authorize @homepage
    if @homepage.save
      render json: WebApi::V1::HomePageSerializer.new(
        @homepage,
        params: fastjson_params
      ).serialized_json, status: :ok
    else
      render json: { errors: @area.errors.details }, status: :unprocessable_entity
    end
  end

#   assuming we don't need destroy since there's just one, it should only ever be updated
#   def destroy
#     @side_fx_service.before_destroy(@area, current_user)
#     area = @area.destroy
#     if area.destroyed?
#       @side_fx_service.after_destroy(area, current_user)
#       head :ok
#     else
#       head :internal_server_error
#     end
#   end

  private

  def set_home_page
    @homepage = HomePage.first
    authorize @homepage
  end

  def home_page_params
    # params.require(:homepage).permit(
    #   :ordering,
    #   title_multiloc: CL2_SUPPORTED_LOCALES,
    #   description_multiloc: CL2_SUPPORTED_LOCALES
    # )
  end
end
