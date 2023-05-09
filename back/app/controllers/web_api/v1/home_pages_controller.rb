# frozen_string_literal: true

class WebApi::V1::HomePagesController < ApplicationController
  before_action :set_home_page
  skip_before_action :authenticate_user, only: %i[show]

  def show
    render json: WebApi::V1::HomePageSerializer.new(@homepage, params: fastjson_params).serializable_hash.to_json
  end

  def update
    @homepage.assign_attributes home_page_params
    authorize @homepage
    SideFxHomePageService.new.before_update(@homepage)
    if @homepage.save
      render json: WebApi::V1::HomePageSerializer.new(
        @homepage,
        params: fastjson_params
      ).serializable_hash.to_json, status: :ok
    else
      render json: { errors: @homepage.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_home_page
    @homepage = HomePage.first
    authorize @homepage
  end

  def home_page_params
    params.require(:home_page).permit(
      :top_info_section_enabled,
      :bottom_info_section_enabled,
      :events_widget_enabled,
      :projects_enabled,
      :banner_avatars_enabled,
      :banner_layout,
      :banner_cta_signed_in_type,
      :banner_cta_signed_in_url,
      :banner_signed_out_header_overlay_color,
      :banner_signed_out_header_overlay_opacity,
      :banner_cta_signed_out_type,
      :banner_cta_signed_out_url,
      :header_bg,
      top_info_section_multiloc: CL2_SUPPORTED_LOCALES,
      projects_header_multiloc: CL2_SUPPORTED_LOCALES,
      banner_signed_in_header_multiloc: CL2_SUPPORTED_LOCALES,
      banner_cta_signed_in_text_multiloc: CL2_SUPPORTED_LOCALES,
      banner_signed_out_header_multiloc: CL2_SUPPORTED_LOCALES,
      banner_signed_out_subheader_multiloc: CL2_SUPPORTED_LOCALES,
      banner_cta_signed_out_text_multiloc: CL2_SUPPORTED_LOCALES,
      bottom_info_section_multiloc: CL2_SUPPORTED_LOCALES,
      pinned_admin_publication_ids: []
    )
  end
end
