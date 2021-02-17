class Tenant < ApplicationRecord
  include PublicApi::TenantDecorator

  mount_base64_uploader :logo, TenantLogoUploader
  mount_base64_uploader :header_bg, TenantHeaderBgUploader
  mount_base64_uploader :favicon, TenantFaviconUploader

  attr_accessor :config_sync_enabled, :auto_config

  validates :name, :host, presence: true
  validates :host, uniqueness: true, exclusion: { in: %w(schema-migrations public) }
  validate :valid_host_format

  validate(on: :update) do |record|
    missing_locales = switch do
      User.where.not(locale: settings.dig('core', 'locales')).pluck(:locale)
    end
    if missing_locales.present?
      record.errors.add(:settings, "is missing locales that are still in use by some users: #{missing_locales.uniq}")
    end
  end

  after_create :create_apartment_tenant
  after_create :create_app_configuration, if: :auto_config

  after_destroy :delete_apartment_tenant

  after_update :update_tenant_schema, if: :saved_change_to_host?
  after_update :update_app_configuration, if: :config_sync_enabled

  after_initialize :custom_initialization

  before_validation :validate_missing_feature_dependencies
  before_validation :ensure_style

  def self.current
    Current.tenant || find_by!(host: Apartment::Tenant.current.gsub(/_/, "."))
  end

  def self.settings(*path)
    ActiveSupport::Deprecation.warn("Tenant::settings is deprecated. Use AppConfiguration::settings instead.")
    AppConfiguration.instance.settings(*path)
  end

  def self.settings_json_schema_str
    ActiveSupport::Deprecation.warn("Tenant::settings_json_schema_str is deprecated. Use AppConfiguration::settings_json_schema_str instead.")
    AppConfiguration.settings_json_schema_str
  end

  def self.settings_json_schema
    ActiveSupport::Deprecation.warn("Tenant::settings_json_schema is deprecated. Use AppConfiguration::settings_json_schema instead.")
    AppConfiguration.settings_json_schema
  end

  def self.style(*path)
    ActiveSupport::Deprecation.warn("Tenant::style is deprecated. Use AppConfiguration::style instead.")
    AppConfiguration.instance.style(*path)
  end

  def self.style_json_schema_str
    ActiveSupport::Deprecation.warn("Tenant::style_json_schema_str is deprecated. Use AppConfiguration::style_json_schema_str instead.")
    AppConfiguration.style_json_schema_str
  end

  def self.style_json_schema
    ActiveSupport::Deprecation.warn("Tenant::settings_json_schema is deprecated. Use AppConfiguration::settings_json_schema instead.")
    AppConfiguration.style_json_schema
  end

  def self.available_style_attributes
    ActiveSupport::Deprecation.warn("Tenant::available_style_attributes is deprecated. Use AppConfiguration::available_style_attributes instead.")
    AppConfiguration.available_style_attributes
  end

  def custom_initialization
    @config_sync_enabled = true
    @auto_config = true
  end

  def disable_auto_config
    self.auto_config = false
    self
  end

  def disable_config_sync
    self.config_sync_enabled = false
    self
  end

  def schema_name
    # The reason for using `host_was` and not `host` is
    # because the schema name would be wrong when updating
    # the tenant's host. `host_was` should always 
    # correspond to the value as it currently is in the
    # database.
    self.host_was&.gsub(/\./, "_")
  end

  def cleanup_settings
    ActiveSupport::Deprecation.warn("Tenant#cleanup_settings is deprecated. Use AppConfiguration#cleanup_settings instead.")
    configuration.cleanup_settings
  end

  def has_feature?(f)
    ActiveSupport::Deprecation.warn("Tenant#cleanup_settings is deprecated. Use AppConfiguration#has_feature? instead.")
    configuration.has_feature?(f)
  end

  def closest_locale_to(locale)
    ActiveSupport::Deprecation.warn("Tenant#closest_locale_to is deprecated. Use AppConfiguration#closest_locale_to instead.")
    configuration.closest_locale_to(locale)
  end

  def public_settings
    ActiveSupport::Deprecation.warn("Tenant#public_settings is deprecated. Use AppConfiguration#public_settings instead.")
    configuration.public_settings
  end

  def base_frontend_uri
    ActiveSupport::Deprecation.warn("Tenant#base_frontend_uri is deprecated. Use AppConfiguration#base_frontend_uri instead.")
    configuration.base_frontend_uri
  end

  # TODO_MT Duplicate code with AppConfiguration
  # (Needed by tenant uploaders to compute +asset_host+ when creating a new tenant with uploads, bc app config does not
  # exist yet).
  def base_backend_uri
    if Rails.env.development?
      "http://localhost:4000"
    else
      transport = Rails.env.test? ? 'http' : 'https'
      "#{transport}://#{self.host}"
    end
  end

  def location
    ActiveSupport::Deprecation.warn("Tenant#location is deprecated. Use AppConfiguration#location instead.")
    configuration.location
  end

  def turn_on_abbreviated_user_names!
    config = self.settings['abbreviated_user_names'] || {}
    self.settings['abbreviated_user_names'] = config.merge({'allowed' => true, 'enabled' => true})
    self.save!
  end

  # @return [AppConfiguration]
  def configuration
    # TODO OS only works for getting the configuration, cannot modify/update it (bc it switches back to the previous schema).
    switch { AppConfiguration.instance }
  end

  def switch
    Apartment::Tenant.switch(schema_name) { yield }
  end

  private

  def create_app_configuration
    switch do
      AppConfiguration.create(
          id: id,
          name: name,
          host: host,
          logo: logo,
          header_bg: header_bg,
          favicon: favicon,
          settings: settings,
          style: style,
          created_at: created_at
      )
    end
  end

  def update_app_configuration
    switch do
      config = AppConfiguration.instance
      attrs_delta = attributes_delta(self, config)
      return unless attrs_delta.present?
      config.attributes = attrs_delta
      config.remove_logo! if logo_previously_changed? && logo.blank?
      config.remove_favicon! if favicon_previously_changed? && favicon.blank?
      config.remove_header_bg! if header_bg_previously_changed? && header_bg.blank?
      config.disable_tenant_sync.save
    end
  end

  def attributes_delta(new_obj, old_obj)
    new_attributes = new_obj.attributes
    old_attributes = old_obj.attributes
    carrierwave_attrs = %w[logo favicon header_bg]
    common_attrs = (old_attributes.keys & new_attributes.keys) - carrierwave_attrs
    new_attributes
        .slice(*common_attrs)
        .select { |k,v| v != old_attributes[k] }
        .tap do |attrs|
          attrs[:logo]      = new_obj.logo      if new_obj.logo_previously_changed?
          attrs[:favicon]   = new_obj.favicon   if new_obj.favicon_previously_changed?
          attrs[:header_bg] = new_obj.header_bg if new_obj.header_bg_previously_changed?
    end
  end


  def create_apartment_tenant
    Apartment::Tenant.create(self.schema_name)
  end

  def delete_apartment_tenant
    Apartment::Tenant.drop(self.schema_name)
  end

  def update_tenant_schema
    old_schema = self.saved_change_to_host.first.gsub(/\./, "_")
    new_schema = self.schema_name
    ActiveRecord::Base.connection.execute("ALTER SCHEMA \"#{old_schema}\" RENAME TO \"#{new_schema}\"")
    # If we were in the apartment of the altered tenant, we switch to the new schema.
    Apartment::Tenant.switch!(new_schema) if old_schema == Apartment::Tenant.current
  end


  def validate_missing_feature_dependencies
    ss = SettingsService.new
    missing_dependencies = ss.missing_dependencies(settings, self.class.settings_json_schema)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end

  def valid_host_format
    return if host == 'localhost'

    if !host.include?('.') || host.include?(' ') || host.include?('_') || (host =~ /[A-Z]/)
      self.errors.add(
          :host,
          :invalid_format,
          message: 'The chosen host does not have a valid format'
      )
    end
  end

  def ensure_style
    self.style ||= {}
  end
end
