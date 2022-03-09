module AdminApi
  class TenantsController < AdminApiController
    before_action :set_tenant, only: %i[show update remove_locale destroy]
    skip_around_action :switch_tenant

    def index
      tenants = Tenant.not_deleted.order(name: :asc)
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
        tenant.errors.merge!(config.errors) if config.present?
        render json: { errors: tenant.errors.details }, status: :unprocessable_entity
      end
    end

    def update
      update_tenant legacy_tenant_params
    end

    def remove_locale
      tenant_service.replace_locale_occurences! @tenant, remove_locale_params[:remove_locale], remove_locale_params[:replacing_locale]

      settings = @tenant.settings
      settings['core']['locales'].delete remove_locale_params[:remove_locale]
      update_tenant settings: settings
    end

    def destroy
      tenant_service.delete(@tenant)
      head :ok
    end

    def settings_schema
      render json: AppConfiguration::Settings.json_schema
    end

    def style_schema
      render json: AppConfiguration.style_json_schema
    end

    def templates
      render json: MultiTenancy::TenantTemplateService.new.available_templates.values.flatten.uniq
    end

    private

    # Helper function to serialize an enumeration of tenants efficiently.
    # It works by batch loading app configurations to avoid n+1 queries.
    # It could be move to a dedicated service if it keeps growing, but
    # keeping things simple for now.
    #
    # @param [Enumerable<Tenant>] tenants
    def serialize_tenants(tenants = nil)
      tenants ||= Tenant.not_deleted
      tenants = tenants.sort_by(&:host)
      configs = AppConfiguration.from_tenants(tenants).sort_by(&:host)

      tenants.zip(configs).map do |tenant, config|
        AdminApi::TenantSerializer.new(tenant, app_configuration: config)
      end
    end

    def update_tenant(attributes)
      success, tenant, config = tenant_service.update_tenant @tenant, attributes
      if success
        tenant_json = AdminApi::TenantSerializer.new(tenant, app_configuration: config).to_json
        render json: tenant_json, status: :ok
      else
        tenant.errors.merge! config.errors
        render json: { errors: tenant.errors.details }, status: :unprocessable_entity
      end
    end

    def template_name
      @template_name ||= params[:template] || 'base'
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

    def remove_locale_params
      params.require(:tenant).permit(
        :remove_locale,
        :replacing_locale
      )
    end

    def tenant_service
      @tenant_service ||= MultiTenancy::TenantService.new
    end
  end
end
