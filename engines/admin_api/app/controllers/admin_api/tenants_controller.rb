module AdminApi
  class TenantsController < AdminApiController

    before_action :set_tenant, only: [:show, :update, :destroy]
    skip_around_action :switch_tenant

    def index
      tenants = Tenant.all.order(name: :asc)
      tenants = tenants.where('name LIKE ?', "%#{params[:search]}%") if params[:search]
      # Call #to_json explicitly, otherwise 'data' is added as root.
      render json: serialize_tenants(tenants).to_json
    end

    def show
      # Call #to_json explicitly, otherwise 'data' is added as root.
      render json: AdminApi::TenantSerializer.new(@tenant).to_json
    end

    def create
      success, tenant, config = tenant_service.initialize_with_template(tenant_params, config_params, template_name)
      if success
        tenant_json = AdminApi::TenantSerializer.new(tenant, app_configuration: config).to_json
        render json: tenant_json, status: :created
      else
        tenant.errors.merge!(config.errors)
        render json: { errors: tenant.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      success, tenant, config = tenant_service.update_tenant(@tenant, legacy_tenant_params)
      if success
        tenant_json = AdminApi::TenantSerializer.new(tenant, app_configuration: config).to_json
        render json: tenant_json, status: :ok
      else
        tenant.errors.merge!(config.errors)
        render json: { errors: tenant.errors.details }, status: :unprocessable_entity
      end
    end

    def destroy
      tenant_side_fx.before_destroy(@tenant)
      if @tenant.destroy.destroyed?
        tenant_side_fx.after_destroy(@tenant)
        head :ok
      else
        head 500
      end
    end

    def settings_schema
      render json: AppConfiguration::Settings.json_schema
    end

    def style_schema
      render json: AppConfiguration.style_json_schema
    end

    def templates
      render json: TenantTemplateService.new.available_templates.values.flatten.uniq
    end

    private

    # Helper function to serialize an enumeration of tenants efficiently.
    # It works by batch loading app configurations to avoid n+1 queries.
    # It could be move to a dedicated service if it keeps growing, but 
    # keeping things simple for now.
    #
    # @param [Enumerable<Tenant>] tenants
    def serialize_tenants(tenants = nil)
      tenants ||= Tenant.all
      tenants = tenants.sort_by(&:host)
      configs = AppConfiguration.from_tenants(tenants).sort_by(&:host)

      tenants.zip(configs).map do |tenant, config|
        AdminApi::TenantSerializer.new(tenant, app_configuration: config)
      end
    end

    def template_name
      @template_name ||= params[:template] || 'base'
    end

    def secure_controller?
      false
    end

    def set_tenant
      @tenant = Tenant.find(params[:id])
    end

    def config_params
      @config_params ||= params.require(:tenant).permit(:host, :name, :logo, :header_bg, settings: {}, style: {})
    end
    alias legacy_tenant_params config_params

    def tenant_params
      @tenant_params ||= params.require(:tenant).permit(:name, :host)
    end

    def tenant_service
      @tenant_service ||= MultiTenancy::TenantService.new
    end

    def tenant_side_fx
      @tenant_side_fx ||= MultiTenancy::SideFxTenantService.new
    end
  end
end
