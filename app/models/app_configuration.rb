# frozen_string_literal: true

class AppConfiguration < ApplicationRecord
  include Frontend::StyleSettings

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :header_bg, AppHeaderBgUploader
  mount_base64_uploader :favicon, FaviconUploader

  attr_accessor :tenant_sync_enabled

  validates :settings, presence: true, json: {
    schema: -> { AppConfiguration::Settings.json_schema_str },
    message: lambda { |errors|
               errors.map do |e|
                 { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] }
               end
             },
    options: { errors_as_objects: true }
  }

  validates :host, presence: true
  validate :validate_host_format
  validate :validate_locales, on: :update
  validate :validate_singleton, on: :create

  before_validation :validate_missing_feature_dependencies

  after_save :update_tenant, if: :tenant_sync_enabled
  after_initialize :custom_initialization

  module Settings
    extend CitizenLab::Mixins::SettingsSpecification

    def self.json_schema
      settings_schema = core_settings_json_schema
      schema_properties = settings_schema['properties']

      extension_features_specs.each_with_object(schema_properties) do |spec, properties|
        properties[spec.feature_name] = spec.json_schema
      end

      settings_schema
    end

    def self.core_settings_json_schema
      return @core_settings_json_schema if @core_settings_json_schema

      schema_filepath = Rails.root.join('config/schemas/settings.schema.json.erb')
      json_schema_str = ERB.new(File.read(schema_filepath)).result(binding)
      @core_settings_json_schema = JSON.parse(json_schema_str)
    end

    def self.extension_features_specs
      extension_features_hash.values
    end

    # @param [CitizenLab::Mixins::FeatureSpecification] specification
    def self.add_feature(specification)
      feature_name = specification.feature_name
      if extension_features_hash.key?(feature_name)
        Rails.logger.warn(
          "Overwriting settings specification for '#{feature_name}' feature.",
          caller: caller
        )
      end

      extension_features_hash[feature_name] = specification
      nil
    end

    def self.extension_features_hash
      @extension_features_hash ||= {}
    end
    private_class_method :extension_features_hash

    def self.reset
      @extension_features_hash = {}
    end
    private_class_method :reset
  end

  class << self
    private :new # We need a singleton

    def instance
      first!
    end
  end

  def custom_initialization
    @tenant_sync_enabled = true
  end

  def disable_tenant_sync
    self.tenant_sync_enabled = false
    self
  end

  # @return [AppConfiguration] self
  def cleanup_settings
    ss = SettingsService.new
    schema = Settings.json_schema
    self.settings = ss.remove_additional_features(settings, schema)
    self.settings = ss.remove_additional_settings(settings, schema)
    self.settings = ss.add_missing_features(settings, schema)
    self.settings = ss.add_missing_settings(settings, schema)
    self
  end

  def feature_activated?(setting_name)
    settings[setting_name]&.values_at('enabled', 'allowed')&.all?
  end

  def has_feature?(f)
    ActiveSupport::Deprecation.warn("AppConfiguration#has_feature? is deprecated. Use AppConfiguration#feature_activated? instead.")
    feature_activated?(f)
  end

  def closest_locale_to(locale)
    locale = locale.to_s
    locales = settings.dig('core', 'locales') || []
    locales.include?(locale) ? locale : locales.first
  end

  def public_settings
    @public_settings ||= SettingsService.new.remove_private_settings(settings, Settings.json_schema)
  end

  def location
    longitude = settings.dig('maps', 'map_center', 'long')
    latitude = settings.dig('maps', 'map_center', 'lat')
    RGeo::Geographic.spherical_factory(srid: 4326).point(longitude, latitude)
  end

  def turn_on_abbreviated_user_names!
    config = settings['abbreviated_user_names'] || {}
    settings['abbreviated_user_names'] = config.merge({ 'allowed' => true, 'enabled' => true })
    save!
  end

  def configuration
    # [TODO] temporary
    Rails.logger.warn('Calling +configuration+ on an AppConfiguration', caller: caller)
    self
  end

  def settings(*path)
    value = read_attribute(:settings)
    path.blank? ? value : value.dig(*path)
  end

  def base_frontend_uri
    return 'http://localhost:3000' if Rails.env.development?
    transport = Rails.env.test? ? 'http' : 'https'
    "#{transport}://#{host}"
  end

  def base_backend_uri
    return 'http://localhost:4000' if Rails.env.development?
    transport = Rails.env.test? ? 'http' : 'https'
    "#{transport}://#{host}"
  end

  private

  def validate_missing_feature_dependencies
    missing_dependencies = SettingsService.new.missing_dependencies(settings, Settings.json_schema)
    return if missing_dependencies.empty?

    errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
  end

  def validate_locales
    missing_locales = User.where.not(locale: settings('core', 'locales')).pluck(:locale).uniq
    return if missing_locales.blank?

    errors.add(:settings, "is missing locales that are still used by some users: #{missing_locales}")
  end

  def validate_host_format
    return if host == 'localhost'

    return unless host.exclude?('.') || host.include?(' ') || host.include?('_') || (host =~ /[A-Z]/)

    errors.add(
        :host,
        :invalid_format,
        message: 'The chosen host does not have a valid format'
      )

  end

  def validate_singleton
    errors.add(:base, 'there can be only one instance of AppConfiguration') if AppConfiguration.count.positive?
  end

  def update_tenant
    tenant = Tenant.current
    attrs_delta = tenant.send(:attributes_delta, self, tenant)
    return if attrs_delta.blank?

    tenant.attributes = attrs_delta
    tenant.remove_logo! if logo_previously_changed? && logo.blank?
    tenant.remove_favicon! if favicon_previously_changed? && favicon.blank?
    tenant.remove_header_bg! if header_bg_previously_changed? && header_bg.blank?
    tenant.disable_config_sync.save
  end
end
