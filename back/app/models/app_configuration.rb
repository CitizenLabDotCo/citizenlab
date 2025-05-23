# frozen_string_literal: true

# == Schema Information
#
# Table name: app_configurations
#
#  id         :uuid             not null, primary key
#  name       :string
#  host       :string
#  logo       :string
#  favicon    :string
#  settings   :jsonb
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  style      :jsonb
#
class AppConfiguration < ApplicationRecord
  include StyleSettings

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :favicon, FaviconUploader

  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  validates :settings, presence: true, json: {
    schema: -> { AppConfiguration::Settings.json_schema }
  }

  validates :host, presence: true
  validate :validate_host_format
  validate :validate_locales, on: :update
  validate :validate_singleton, on: :create

  before_validation :validate_missing_feature_dependencies
  before_validation :add_missing_features_and_settings, on: :create
  before_validation :sanitize_organization_name

  module Settings
    extend CitizenLab::Mixins::SettingsSpecification

    def self.json_schema
      settings_schema = core_settings_json_schema.deep_dup # deep_dup to avoid modifying core schema

      extension_features_specs.each do |spec|
        settings_schema['properties'][spec.feature_name] = spec.json_schema
        settings_schema['dependencies'][spec.feature_name] = spec.dependencies if spec.dependencies.present?
      end

      settings_schema.with_indifferent_access
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

    def self.extension_features
      extension_features_hash.keys
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
    # We prevent the direct instantiation of AppConfiguration, because it is a singleton.
    private :new

    # `AppConfiguration.instance` returns a cached (memoized) version of the
    # app configuration. So, unless you know what you're doing, all operations on the
    # app configuration should be done through `AppConfiguration.instance`. For instance,
    # by default, any change made to another instance of `AppConfiguration` will not be
    # reflected in the cached version. To decrease the risk associated with this, we make
    # some methods private. Ideally, `find` should also be private, but it is used when
    # deserializing Que-job arguments that refer to ActiveRecord objects.
    private(
      :find_by, :find_by!, :find_or_create_by, :find_or_create_by!,
      :first, :first!,
      :last, :last!,
      :update, :update!
    )

    def instance
      Current.app_configuration
    end

    def timezone
      timezone_str = instance.settings.dig('core', 'timezone')
      ActiveSupport::TimeZone[timezone_str] or raise KeyError, timezone_str
    end
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

  def add_missing_features_and_settings
    ss = SettingsService.new
    schema = Settings.json_schema
    self.settings = ss.add_missing_features(settings, schema)
    self.settings = ss.add_missing_settings(settings, schema)
  end

  def sanitize_organization_name
    organization_name = settings.dig('core', 'organization_name')

    settings['core']['organization_name'] = SanitizationService.new.sanitize_multiloc(
      organization_name,
      []
    )
  end

  def feature_activated?(setting_name)
    settings[setting_name]&.values_at('enabled', 'allowed')&.all?
  end

  def closest_locale_to(locale)
    locale = locale.to_s
    locales = settings.dig('core', 'locales') || []
    locales.any? { |l| l.include?(locale) } ? locales.find { |l| l.include?(locale) } : locales.first
  end

  def public_settings
    @public_settings ||= SettingsService.new.format_for_front_end(settings, Settings.json_schema)
  end

  def location
    longitude = settings.dig('maps', 'map_center', 'long')
    latitude = settings.dig('maps', 'map_center', 'lat')
    RGeo::Geographic.spherical_factory(srid: 4326).point(longitude, latitude)
  end

  def configuration
    Rails.logger.warn('Calling +configuration+ on an AppConfiguration', caller: caller)
    self
  end

  def settings(*path)
    value = read_attribute(:settings)
    path.blank? ? value : value.dig(*path)
  end

  def base_frontend_uri
    base_uri(ENV['BASE_DEV_URI'].presence || 'http://localhost:3000')
  end

  def base_backend_uri
    base_uri(ENV['BASE_DEV_URI'].presence || 'http://localhost:4000')
  end

  def base_asset_host_uri
    if Rails.env.development? && ENV['USE_AWS_S3_IN_DEV'] == 'true'
      "https://#{ENV.fetch('AWS_S3_BUCKET')}.s3.#{ENV.fetch('AWS_REGION')}.amazonaws.com"
    else
      # ASSET_HOST_URI env var can be used for:
      # - e2e tests (see e2e/docker-compose.yml)
      # - demos on ngrok/localtunnel
      #   run `lt --port 3000 --subdomain local-env` and set `ASSET_HOST_URI=https://local-env.loca.lt/`
      # - in rake tasks that need to download images. Set `ASSET_HOST_URI=http://cl-back-web:4000/`

      # localhost:3000 works (webpack proxies requests to localhost:4000)
      # using the app from the browser, but localhost:4000 is a better default
      # because it's more universal:
      # it works both in the browser and in the BE code that runs in cl-back-web container
      # (e.g., to copy images applying a tenant template or copying a project).
      base_uri(ENV.fetch('ASSET_HOST_URI', 'http://localhost:4000'))
    end
  end

  def lifecycle_stage
    settings.dig('core', 'lifecycle_stage')
  end

  def active?
    lifecycle_stage == 'active'
  end

  def churned?
    lifecycle_stage == 'churned'
  end

  private

  def base_uri(development_uri)
    return development_uri if Rails.env.development?

    transport = Rails.env.test? ? 'http' : 'https'
    "#{transport}://#{host}"
  end

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
end

AppConfiguration.include(MultiTenancy::Extensions::AppConfiguration)
