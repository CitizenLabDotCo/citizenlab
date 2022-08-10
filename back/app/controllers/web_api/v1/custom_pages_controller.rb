# frozen_string_literal: true

class WebApi::V1::CustomPagesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[show by_slug]

  def show
    authorize @page
    render json: WebApi::V1::CustomPageSerializer.new(@page, params: fastjson_params).serialized_json
  end

  def by_slug
    @page = CustomPage.find_by! slug: params[:slug]
    authorize @page
    show
  end

  # def update
  #   @homepage.assign_attributes home_page_params
  #   authorize @homepage
  #   SideFxHomePageService.new.before_update(@homepage)
  #   if @homepage.save
  #     render json: WebApi::V1::HomePageSerializer.new(
  #       @homepage,
  #       params: fastjson_params
  #     ).serialized_json, status: :ok
  #   else
  #     render json: { errors: @homepage.errors.details }, status: :unprocessable_entity
  #   end
  # end

  private

  def home_page_params
    params.require(:home_page).permit(
      :slug,
      :banner_enabled,
      :banner_layout,
      :banner_overlay_color,
      :banner_overlay_opacity,
      :banner_cta_button_type,
      :banner_cta_button_url,
      :top_info_section_enabled,
      :bottom_info_section_enabled,
      :events_widget_enabled,
      :projects_enabled,
      :projects_filter_type,
      :header_bg,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      banner_cta_button_multiloc: CL2_SUPPORTED_LOCALES,
      banner_header_multiloc: CL2_SUPPORTED_LOCALES,
      banner_subheader_multiloc: CL2_SUPPORTED_LOCALES,
      top_info_section_multiloc: CL2_SUPPORTED_LOCALES,
      bottom_info_section_multiloc: CL2_SUPPORTED_LOCALES,
      pinned_admin_publication_ids: []
    )
  end
end
