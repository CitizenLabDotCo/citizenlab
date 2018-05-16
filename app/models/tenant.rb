require_dependency "tenant_schema/extended_schema"

class Tenant < ApplicationRecord

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :header_bg, HeaderBgUploader

  validates :name, :host, presence: true
  validates :host, uniqueness: true

  SETTINGS_JSON_SCHEMA_STR = ERB.new(File.read(Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb'))).result(binding)
  SETTINGS_JSON_SCHEMA = JSON.parse(SETTINGS_JSON_SCHEMA_STR)
  validates :settings, presence: true, json: { 
    schema: SETTINGS_JSON_SCHEMA_STR, 
    message: ->(errors) { errors.map{|e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
    options: {
      errors_as_objects: true
    }
  }

  after_create :create_apartment_tenant
  after_destroy :delete_apartment_tenant
  after_update :update_tenant_schema, if: :saved_change_to_host?

  before_validation :validate_missing_feature_dependencies

  def self.current
    find_by!(host: Apartment::Tenant.current.gsub(/_/, "."))
  end

  def self.settings *path
   self.current.settings.dig(*path)
  end

  def schema_name
    self.host.gsub(/\./, "_")
  end

  def cleanup_settings
    ss = SettingsService.new
    self.settings = ss.remove_additional_features(self.settings, SETTINGS_JSON_SCHEMA)
    self.settings = ss.remove_additional_settings(self.settings, SETTINGS_JSON_SCHEMA)
    self.settings = ss.add_missing_features(self.settings, SETTINGS_JSON_SCHEMA)
    self.settings = ss.add_missing_settings(self.settings, SETTINGS_JSON_SCHEMA)
  end

  def has_feature f
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
    ss.remove_private_settings(self.settings, SETTINGS_JSON_SCHEMA)
  end

  def base_frontend_uri
    if Rails.env.development? || Rails.env.test?
      "http://localhost:3000"
    else
      transport = 'https' # request.ssl? ? 'https' : 'http'
      "#{transport}://#{self.host}"
    end
  end

  def base_backend_uri
    if Rails.env.development? || Rails.env.test?
      "http://localhost:4000"
    else
      transport = 'https' # request.ssl? ? 'https' : 'http'
      "#{transport}://#{self.host}"
    end
  end

  def location
    RGeo::Geographic.spherical_factory(:srid => 4326).point(settings.dig('maps', 'map_center', 'long'), settings.dig('maps', 'map_center', 'lat'))
  end
  
  private

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
    missing_dependencies = ss.missing_dependencies(settings, SETTINGS_JSON_SCHEMA)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end

end
