module AdminApi
  class TenantsController < AdminApiController

    before_action :set_tenant, only: [:show, :update, :destroy]
    skip_around_action :switch_tenant

    def index
      @tenants = Tenant.all.order(name: :asc)
      @tenants = @tenants.where("name LIKE ?", params[:search] + '%') if params[:search]
      render json: @tenants
    end

    def show
      render json: @tenant
    end

    def create
      @tenant = Tenant.new tenant_params
      SideFxTenantService.new.before_create @tenant, nil
      if @tenant.save
        SideFxTenantService.new.after_create @tenant, nil
        Apartment::Tenant.switch(@tenant.schema_name) do
          TenantTemplateService.new.resolve_and_apply_template(params[:template] || 'base')
        end
        SideFxTenantService.new.after_apply_template @tenant, nil
        render json: @tenant, status: :created
      else
        render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
      end
    end

    def update
      new_settings = if tenant_params[:settings]
        new_settings = @tenant.settings.deep_merge(tenant_params[:settings].to_h)
        @tenant.assign_attributes(settings: new_settings)
      end
      if tenant_params[:style]
        new_style = @tenant.style.deep_merge(tenant_params[:style].to_h) if tenant_params[:style]
        @tenant.assign_attributes(style: new_style)
      end

      SideFxTenantService.new.before_update(@tenant, nil)

      if @tenant.update(tenant_params.except(:settings, :style))
        SideFxTenantService.new.after_update(@tenant, nil)
        render json: @tenant, status: :ok
      else
        render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
      end
    end

    def settings_schema
      render json: Tenant::SETTINGS_JSON_SCHEMA
    end

    def style_schema
      render json: Frontend::TenantStyle::STYLE_JSON_SCHEMA
    end

    def templates
      render json: TenantTemplateService.new.available_templates
    end

    def destroy
      SideFxTenantService.new.before_destroy(@tenant, nil)
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
      all_style = params.require(:tenant).fetch(:style, nil).try(:permit!)
      params
        .require(:tenant)
        .permit(:name, :host, :logo, :header_bg)
        .merge(:settings => all_settings)
        .merge(:style => all_style)
    end

  end
end
