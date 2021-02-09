module AdminApi
  class TenantsController < AdminApiController

    before_action :set_tenant, only: [:show, :update, :destroy]
    skip_around_action :switch_tenant

    def index
      tenants = Tenant.all.order(name: :asc)
      tenants = tenants.where('name LIKE ?', "%#{params[:search]}%") if params[:search]
      # Call #to_json explicitly, otherwise 'data' is added as root.
      render json: MultiTenancy::TenantService.serialize_tenants(tenants).to_json
    end

    def show
      # This uses default model serialization
      render json: @tenant
    end

    def create
      template = params[:template] || 'base'
      required_locales = TenantTemplateService.new.required_locales(template, external_subfolder: 'test')
      if !Set.new(required_locales).subset?(Set.new(tenant_params.dig(:settings, 'core', 'locales')))
        raise ClErrors::TransactionError.new(error_key: :missing_locales)
      end
      @tenant = Tenant.new tenant_params
      SideFxTenantService.new.before_create @tenant, nil
      if @tenant.save
        SideFxTenantService.new.after_create @tenant, nil
        ApplyTenantTemplateJob.perform_later template, @tenant
        # This uses default model serialization
        render json: @tenant, status: :created
      else
        render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
      end
    end

    def update
      if tenant_params[:settings]
        @tenant.assign_attributes(settings: tenant_params[:settings])
      end

      if tenant_params[:style]
        @tenant.assign_attributes(style: tenant_params[:style])
      end

      @tenant.assign_attributes(tenant_params.except(:settings, :style))

      SideFxTenantService.new.before_update(@tenant, nil)

      if @tenant.save
        SideFxTenantService.new.after_update(@tenant, nil)
        # This uses default model serialization
        render json: @tenant, status: :ok
      else
        render json: {errors: @tenant.errors.details}, status: :unprocessable_entity
      end
    end

    def settings_schema
      render json: AppConfiguration.settings_json_schema
    end

    def style_schema
      render json: AppConfiguration.style_json_schema
    end

    def templates
      render json: TenantTemplateService.new.available_templates.values.flatten.uniq
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
