# frozen_string_literal: true

class WebApi::V1::AppConfigurationsController < ApplicationController
  skip_before_action :authenticate_user

  def show
    render json: WebApi::V1::AppConfigurationSerializer.new(app_configuration).serializable_hash
  end

  def update
    # This admin sees these features as on whatever the tenant says, so a change based on
    # what they see could silently switch the feature off for everyone else.
    overridden = config_params.fetch(:settings, {}).keys & Current.early_access_overrides.to_a
    if overridden.any?
      app_configuration.errors.add(:settings, 'early_access_override', value: overridden)
      render json: { errors: app_configuration.errors.details }, status: :unprocessable_entity
      return
    end

    update_configuration!(app_configuration, config_params)
    side_fx_service = SideFxAppConfigurationService.new
    side_fx_service.before_update(app_configuration, current_user)

    if app_configuration.save
      side_fx_service.after_update(app_configuration, current_user)
      render json: WebApi::V1::AppConfigurationSerializer.new(app_configuration).serializable_hash
    else
      render json: { errors: app_configuration.errors.details }, status: :unprocessable_entity
    end
  end

  private

  # Update the configuration attributes according to config params without saving it.
  def update_configuration!(configuration, params)
    configuration.attributes = configuration.attributes.deep_merge(params.to_h).compact
    remove_images!(configuration, params)
    configuration
  end

  def remove_images!(configuration, config_params)
    remove_image_if_requested!(configuration, config_params, 'logo')
    remove_image_if_requested!(configuration, config_params, 'favicon')
  end

  def app_configuration
    @app_configuration ||= authorize AppConfiguration.instance
  end

  def config_params
    @config_params ||= params.require(:app_configuration)
      .permit(:logo, :favicon, settings: {}, style: {})
  end
end

WebApi::V1::AppConfigurationsController.include(AggressiveCaching::Patches::WebApi::V1::AppConfigurationsController)
