class AdminApi::TenantsController < AdminApi::AdminApiController

  before_action :set_tenant, only: [:show, :update, :destroy]
  skip_around_action :switch_tenant

  def index
    @tenants = Tenant.all
    @tenants = @tenants.where("name LIKE ?", params[:search] + '%') if params[:search]
    render json: @tenants
  end

  def show
    render json: @tenant
  end

  def create
    @tenant = Tenant.new(tenant_params)
    SideFxTenantService.new.before_create(@tenant, nil)
    if @tenant.save
      SideFxTenantService.new.after_create(@tenant, nil)
      Apartment::Tenant.switch(@tenant.schema_name) do
        TenantTemplateService.new.apply_template(params[:template] || 'base')
      end
      render json: @tenant, status: :created
    else
      render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    updated_settings = @tenant.settings.deep_merge(tenant_params[:settings].to_h)
    SideFxTenantService.new.before_update(@tenant, nil)
    if @tenant.update(tenant_params)
      SideFxTenantService.new.after_update(@tenant, nil)
      render json: @tenant, status: :ok
    else
      render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
    end
  end

  def settings_schema
    render json: Tenant::SETTINGS_JSON_SCHEMA
  end

  def templates
    render json: TenantTemplateService.new.available_templates
  end

  def destroy
    tenant = @tenant.destroy
    if tenant.destroyed?
      SideFxTenantService.new.after_destroy(tenant, nil)
      head :ok
    else
      head 500
    end
  end

  private

  def secure_controller?
    false
  end

  def set_tenant
    @tenant = Tenant.find(params[:id])
  end

  def tenant_params
    # Not perfect, but it's hard to translate all the features/settings to
    # permitted attributes structure, at least in a general way. The json
    # schema validation, however, should be covering all settings that are not
    # allowed
    all_settings = params.require(:tenant).fetch(:settings, nil).try(:permit!)
    params.require(:tenant).permit(:name, :host, :logo, :header_bg).merge(:settings => all_settings)
  end

end
