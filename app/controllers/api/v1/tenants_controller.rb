class Api::V1::TenantsController < ApplicationController

  before_action :set_tenant, only: [:current, :update]

  def current
    render json: @tenant
  end

  def update
    updated_settings = Tenant.current.settings.deep_merge(tenant_params[:settings].to_h)
    if @tenant.update(settings: updated_settings)
      render json: @tenant, status: :ok
    else
      render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
    end
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
    params.require(:tenant).permit(:title).merge(:settings => all_settings)
  end

end
