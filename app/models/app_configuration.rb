require 'set'

class AppConfiguration < ApplicationRecord
  include Frontend::StyleSettings
  extend CitizenLab::Mixins::SettingsSpecification

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :header_bg, AppHeaderBgUploader
  mount_base64_uploader :favicon, FaviconUploader

  validates :settings, presence: true, json: {
    schema: -> { AppConfiguration.settings_json_schema_str },
    message: ->(errors) { errors.map { |e| { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] } } },
    options: { errors_as_objects: true }
  }

  validates :host, presence: true
  validate :validate_host_format
  validate :validate_locales, on: :update
  validate :validate_singleton, on: :create

  before_validation :validate_missing_feature_dependencies
  after_update :update_tenant

  module CoreSettings
    extend CitizenLab::Mixins::SettingsSpecification

    def self.settings_json_schema_str
      settings_schema_filepath = Rails.root.join('config/schemas/settings.schema.json.erb')
      @settings_json_schema_str ||= ERB.new(File.read(settings_schema_filepath)).result(binding)
    end
  end

  class << self

    private :new # We need a singleton

    def instance
      first!
    end

    def settings_json_schema
      settings_schema = CoreSettings.settings_json_schema
      schema_properties = settings_schema['properties']

      extensions_settings_specs.each_with_object(schema_properties) do |spec, properties|
        properties[spec.settings_name] = spec.settings_json_schema
      end

      settings_schema
    end

    # @return [Array<CitizenLab::Mixins::SettingsSpecification>]
    def extensions_settings_specs
      @extensions_settings_specs ||= []
    end
  end

  # @return [AppConfiguration] self
  def cleanup_settings
    ss = SettingsService.new
    self.settings = ss.remove_additional_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.remove_additional_settings(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_settings(self.settings, self.class.settings_json_schema)
    self
  end

  def has_feature?(f)
    settings.dig(f, 'allowed') && settings.dig(f, 'enabled')
  end

  def closest_locale_to(locale)
    locale = locale.to_s
    locales = settings.dig('core', 'locales') || []
    locales.include?(locale) ? locale : locales.first
  end

  def public_settings
    @public_settings ||= SettingsService.new.remove_private_settings(self.settings, self.class.settings_json_schema)
  end

  def location
    longitude = settings.dig('maps', 'map_center', 'long')
    latitude = settings.dig('maps', 'map_center', 'lat')
    RGeo::Geographic.spherical_factory(:srid => 4326).point(longitude, latitude)
  end

  def turn_on_abbreviated_user_names!
    config = self.settings['abbreviated_user_names'] || {}
    self.settings['abbreviated_user_names'] = config.merge({ 'allowed' => true, 'enabled' => true })
    self.save!
  end

  def configuration
    # [TODO] temporary
    Rails.logger.warn("Calling +configuration+ on an AppConfiguration", caller: caller)
    self
  end

  def settings(*path)
    value = read_attribute(:settings)
    path.blank? ? value : value.dig(*path)
  end

  def base_frontend_uri
    return "http://localhost:3000" if Rails.env.development?
    transport = Rails.env.test? ? 'http' : 'https'
    "#{transport}://#{host}"
  end

  def base_backend_uri
    return "http://localhost:4000" if Rails.env.development?
    transport = Rails.env.test? ? 'http' : 'https'
    "#{transport}://#{host}"
  end

  private

  def validate_missing_feature_dependencies
    missing_dependencies = SettingsService.new.missing_dependencies(settings, self.class.settings_json_schema)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
  end

  def validate_locales
    missing_locales = User.where.not(locale: settings('core', 'locales')).pluck(:locale).uniq
    if missing_locales.present?
      errors.add(:settings, "is missing locales that are still used by some users: #{missing_locales}")
    end
  end

  def validate_host_format
    return if host == 'localhost'

    if !host.include?('.') || host.include?(' ') || host.include?('_') || (host =~ /[A-Z]/)
      self.errors.add(
        :host,
        :invalid_format,
        message: 'The chosen host does not have a valid format'
      )
    end
  end

  def validate_singleton
    self.errors.add(:base, "there can be only one instance of AppConfiguration") if AppConfiguration.count > 0
  end

  def update_tenant
    return if caller.any? { |s| s.match?(/tenant\.rb.*`update_app_configuration'/) }
    tenant = Tenant.current
    attrs_delta = tenant.send(:attributes_delta, self, tenant)
    return unless attrs_delta.present?
    tenant.attributes = attrs_delta
    tenant.remove_logo! if logo_previously_changed? && logo.blank?
    tenant.remove_favicon! if favicon_previously_changed? && favicon.blank?
    tenant.remove_header_bg! if header_bg_previously_changed? && header_bg.blank?
    tenant.save
  end

end
