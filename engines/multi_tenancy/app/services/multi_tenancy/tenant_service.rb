# frozen_string_literal: true

module MultiTenancy
  class TenantService

    attr_reader :tenant_side_fx, :config_side_fx

    def initialize
      @tenant_side_fx = SideFxTenantService.new
      @config_side_fx = SideFxAppConfigurationService.new
    end

    # @return [Array(Boolean, Tenant, AppConfiguration)]
    def initialize_tenant(tenant_attrs, config_attrs)
      tenant = Tenant.new(tenant_attrs)
      tenant_side_fx.before_create(tenant)

      config = ActiveRecord::Base.transaction do
        tenant.disable_auto_config.save!
        # The tenant must be saved before proceeding with the AppConfiguration because:
        # - the app configuration creation and its side effects must run within the tenant context,
        # - we want to reuse the same id for app configuration.
        tenant.switch do
          config = AppConfiguration.send(:new, config_attrs.merge(id: tenant.id))
          config_side_fx.before_create(config)
          config.save! # The config-tenant sync implicitly initializes (shared) tenant attributes.
          config
        end
      end

      tenant.reload
      tenant_side_fx.after_create(tenant)
      tenant.switch { config_side_fx.after_create(config) }
      [true, tenant, config]
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotSaved
      [false, tenant, config]
    end

    # @return [Array(Boolean, Tenant, AppConfiguration)]
    def initialize_with_template(tenant_attrs, config_attrs, template_name)
      locales = config_attrs.dig('settings', 'core', 'locales')
      validate_locales(template_name, locales)

      success, tenant, _config = result = initialize_tenant(tenant_attrs, config_attrs)
      ApplyTenantTemplateJob.perform_later(template_name, tenant) if success
      result
    end

    # @param [Tenant] tenant
    def update_tenant(tenant, attrs)
      tenant.switch do
        config = tenant.configuration
        config.attributes = attrs
        config_side_fx.before_update(config)

        ActiveRecord::Base.transaction do
          config.save!
          tenant.reload
          tenant.attributes = attrs.slice(:host, :name)
          tenant_side_fx.before_update(tenant)
          tenant.disable_config_sync.save!
        end

        config_side_fx.after_update(config)
        tenant_side_fx.after_update(tenant)
        [true, tenant, config]
      end
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotSaved
      [false, tenant, config]
    end

    # Helper function to serialize an enumeration of tenants efficiently.
    # It works by batch loading app configurations to avoid n+1 queries.
    #
    # @param [Enumerable<Tenant>] tenants
    def self.serialize_tenants(tenants = nil)
      tenants ||= Tenant.all
      tenants = tenants.sort_by(&:host)
      configs = AppConfiguration.from_tenants(tenants).sort_by(&:host)

      tenants.zip(configs).map do |tenant, config|
        WebApi::V1::External::TenantSerializer.new(tenant, app_configuration: config)
      end
    end

    private

    # @param [String] template_name
    # @param [Enumerable<String>] config_locales
    def validate_locales(template_name, config_locales)
      required_locales = TenantTemplateService.new.required_locales(template_name, external_subfolder: 'test')
      unless required_locales.to_set <= config_locales.to_set
        raise ClErrors::TransactionError.new(error_key: :missing_locales)
      end
    end
  end
end
