class Tenant < ApplicationRecord
  include PublicApi::TenantDecorator
  include Frontend::TenantStyle

  mount_base64_uploader :logo, TenantLogoUploader
  mount_base64_uploader :header_bg, TenantHeaderBgUploader
  mount_base64_uploader :favicon, TenantFaviconUploader

  validates :name, :host, presence: true
  validates :host, uniqueness: true, exclusion: { in: %w(schema-migrations public) }
  validate :valid_host_format

  validates :settings, presence: true, json: { 
    schema: -> { Tenant.settings_json_schema_str }, 
    message: ->(errors) { errors.map{|e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
    options: {
      errors_as_objects: true
    }
  }

  validate(on: :update) do |record|
    missing_locales = Apartment::Tenant.switch(schema_name) do 
      User.where.not(locale: settings.dig('core', 'locales')).pluck(:locale)
    end
    if missing_locales.present?
      record.errors.add(:settings, "is missing locales that are still in use by some users: #{missing_locales.uniq}")
    end
  end

  after_create :create_apartment_tenant, :create_app_configuration
  after_destroy :delete_apartment_tenant
  after_update :update_tenant_schema, if: :saved_change_to_host?
  after_update :update_app_configuration

  before_validation :validate_missing_feature_dependencies

  def self.current
    Current.tenant || find_by!(host: Apartment::Tenant.current.gsub(/_/, "."))
  end

  def self.settings *path
   self.current.settings.dig(*path)
  end

  def self.settings_json_schema_str
    @@settings_json_schema_str ||= ERB.new(File.read(Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb')))
      .result(binding)
  end

  def self.settings_json_schema
    @@settings_json_schema ||= JSON.parse(settings_json_schema_str)
  end

  def self.style *path
   self.current.style.dig(*path)
  end

  def self.style_json_schema_str
    @@style_json_schema_str ||= ERB.new(File.read(Rails.root.join('engines', 'frontend', 'config', 'schemas', 'tenant_style.json_schema.erb')))
      .result(binding)
  end

  def self.style_json_schema
    @@style_json_schema ||= JSON.parse(style_json_schema_str)
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
    ss = SettingsService.new
    self.settings = ss.remove_additional_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.remove_additional_settings(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_settings(self.settings, self.class.settings_json_schema)
  end

  def has_feature? f
    settings.dig(f, 'allowed') && settings.dig(f, 'enabled')
  end

  def closest_locale_to locale
    locales = settings.dig('core', 'locales')
    if locales && locales.include?(locale.to_s)
      locale
    else
      locales.first
    end
  end

  def public_settings
    ss = SettingsService.new
    ss.remove_private_settings(self.settings, self.class.settings_json_schema)
  end

  def base_frontend_uri
    if Rails.env.development?
      "http://localhost:3000"
    else
      transport = Rails.env.test? ? 'http' : 'https'
      "#{transport}://#{self.host}"
    end
  end

  def base_backend_uri
    if Rails.env.development?
      "http://localhost:4000"
    else
      transport = Rails.env.test? ? 'http' : 'https'
      "#{transport}://#{self.host}"
    end
  end

  def location
    RGeo::Geographic.spherical_factory(:srid => 4326).point(settings.dig('maps', 'map_center', 'long'), settings.dig('maps', 'map_center', 'lat'))
  end

  def turn_on_abbreviated_user_names!
    config = self.settings['abbreviated_user_names'] || {}
    self.settings['abbreviated_user_names'] = config.merge({'allowed' => true, 'enabled' => true})
    self.save!
  end

  private

  def create_app_configuration
    AppConfiguration.create(
        host: tenant.host,
        logo: tenant.logo,
        header_bg: tenant.header_bg,
        favicon: tenant.favicon,
        settings: tenant.settings,
        style: tenant.style,
        created_at: tenant.created_at
    )
  end

  def update_app_configuration
    AppConfiguration.instance.update!(
        host: tenant.host,
        logo: tenant.logo,
        header_bg: tenant.header_bg,
        favicon: tenant.favicon,
        settings: tenant.settings,
        style: tenant.style,
        created_at: tenant.created_at
    )
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
  end


  def validate_missing_feature_dependencies
    ss = SettingsService.new
    missing_dependencies = ss.missing_dependencies(settings, self.class.settings_json_schema)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end

  def valid_host_format
    if host != 'localhost' && (!host.include?('.') || host.include?(' ') || (host =~ /[A-Z]/) || host.include?('_'))
      self.errors.add(
        :host,
        :invalid_format,
        message: 'The chosen host does not have a valid format'
      )
    end
  end

end
