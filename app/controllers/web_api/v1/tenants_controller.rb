class WebApi::V1::TenantsController < ApplicationController

  before_action :set_tenant, only: [:current, :update]

  def current
    render json: WebApi::V1::TenantSerializer.new(@tenant, params: fastjson_params).serialized_json
  end

  def update
    updated_settings = Tenant.current.settings.deep_merge(tenant_params[:settings].to_h)
    updated_style = Tenant.current.style.deep_merge(tenant_params[:style].to_h)
    params = {settings: updated_settings, style: updated_style}
    params[:logo] = tenant_params[:logo] if tenant_params[:logo]
    params[:header_bg] = tenant_params[:header_bg] if tenant_params[:header_bg]
    params[:favicon] = tenant_params[:favicon] if tenant_params[:favicon]
    @tenant.assign_attributes params
    # setting the header image, logo or favicon attributes to nil will not remove the images
    if tenant_params.keys.include?('header_bg') && tenant_params['header_bg'] == nil
      @tenant.remove_header_bg!
    end
    if tenant_params.keys.include?('logo') && tenant_params['logo'] == nil
      @tenant.remove_logo!
    end
    if tenant_params.keys.include?('favicon') && tenant_params['favicon'] == nil
      @tenant.remove_favicon!
    end
    authorize @tenant
    SideFxTenantService.new.before_update @tenant, current_user
    if @tenant.save
      SideFxTenantService.new.after_update @tenant, current_user
      render(
        json: WebApi::V1::TenantSerializer.new(@tenant, params: fastjson_params).serialized_json,
        status: :ok
        )
    else
      render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
    end
    response.set_header('Warning', '299 - "Deprecated API"')
  end

  private

  def secure_controller?
    false
  end

  def set_tenant
    @tenant = Tenant.current
    authorize @tenant
  end

  def tenant_params
    # Not perfect, but it's hard to translate all the features/settings to
    # permitted attributes structure, at least in a general way. The json
    # schema validation, however, should be covering all settings that are not
    # allowed
    all_settings = params.require(:tenant).fetch(:settings, nil).try(:permit!)
    all_styles = params.require(:tenant).fetch(:style, nil).try(:permit!)
    params.require(:tenant).permit(:logo, :header_bg, :favicon)
      .merge(:settings => all_settings)
      .merge(:style => all_styles)
  end

end
