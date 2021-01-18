class AppConfiguration < ApplicationRecord
  # [TODO] checks mixins
  include PublicApi::TenantDecorator
  include Frontend::TenantStyle

  class << self

    private :new  # We need a singleton

    def instance
      self.first
    end

    def settings_json_schema_str
      settings_schema_filepath = Rails.root.join('config', 'schemas', 'tenant_settings.json_schema.erb')
      @settings_json_schema_str ||= ERB.new(File.read(settings_schema_filepath)).result(binding)
    end

    def settings_json_schema
      @settings_json_schema ||= JSON.parse(settings_json_schema_str)
    end

    # [TODO] dependency to front-end engine ok?
    def style_json_schema_str
      style_schema_filepath = Rails.root.join('engines', 'frontend', 'config', 'schemas', 'tenant_style.json_schema.erb')
      @style_json_schema_str ||= ERB.new(File.read(style_schema_filepath)).result(binding)
    end

    def style_json_schema
      @style_json_schema ||= JSON.parse(style_json_schema_str)
    end

    def create_default
      # [TODO] create a default configuration
      self.create
    end
  end

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :header_bg, AppHeaderBgUploader
  mount_base64_uploader :favicon, FaviconUploader

  validates :settings, presence: true, json: {
      schema: -> { AppConfiguration.settings_json_schema_str },
      message: ->(errors) { errors.map { |e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
      options: { errors_as_objects: true }
  }

  validate(on: :update) do |record|
    missing_locales = User.where.not(locale: settings.dig('core', 'locales')).pluck(:locale).uniq
    if missing_locales.present?
      record.errors.add(:settings, "is missing locales that are still in use by some users: #{missing_locales}")
    end
  end

  before_validation :validate_missing_feature_dependencies
  after_update :update_tenant

  def cleanup_settings
    ss = SettingsService.new
    self.settings = ss.remove_additional_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.remove_additional_settings(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_features(self.settings, self.class.settings_json_schema)
    self.settings = ss.add_missing_settings(self.settings, self.class.settings_json_schema)
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
    self.settings['abbreviated_user_names'] = config.merge({'allowed' => true, 'enabled' => true})
    self.save!
  end

  private

  def validate_missing_feature_dependencies
    ss = SettingsService.new
    missing_dependencies = ss.missing_dependencies(settings, self.class.settings_json_schema)
    unless missing_dependencies.empty?
      errors.add(:settings, "has unactive features that other features are depending on: #{missing_dependencies}")
    end
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
