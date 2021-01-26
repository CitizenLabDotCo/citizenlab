class WebApi::V1::AppConfigurationsController < ApplicationController

  def show
    render json: WebApi::V1::AppConfigurationSerializer.new(app_configuration).serialized_json
  end

  def update
    update_configuration!(app_configuration, config_params)
    side_fx_service = SideFxAppConfigurationService.new
    side_fx_service.before_update(app_configuration, current_user)

    if app_configuration.save
      side_fx_service.after_update(app_configuration, current_user)
      render json: WebApi::V1::AppConfigurationSerializer.new(app_configuration).serialized_json
    else
      render json: { errors: app_configuration.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def secure_controller?
    false
  end

  # Update the configuration attributes according to config params without saving it.
  def update_configuration!(configuration, params)
    configuration.attributes = {
        settings:  configuration.settings.deep_merge!(params[:settings].to_h),
        style:     configuration.style.deep_merge!(params[:style].to_h),
        logo:      params[:logo],
        header_bg: params[:header_bg],
        favicon:   params[:favicon],
    }.compact
    remove_images!(configuration, params)
    configuration
  end

  def remove_images!(configuration, config_params)
    configuration.remove_logo!      if config_params.include?('logo')      and config_params['logo'].nil?
    configuration.remove_header_bg! if config_params.include?('header_bg') and config_params['header_bg'].nil?
    configuration.remove_favicon!   if config_params.include?('favicon')   and config_params['favicon'].nil?
  end

  def app_configuration
    @app_configuration ||= authorize AppConfiguration.instance
  end

  def config_params
    return @config_params if @config_params
    @config_params = params.require(:app_configuration)
                           .permit(:logo, :header_bg, :favicon, settings: {}, style: {})
  end
end
