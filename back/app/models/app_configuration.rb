# frozen_string_literal: true

# == Schema Information
#
# Table name: app_configurations
#
#  id                     :uuid             not null, primary key
#  name                   :string
#  host                   :string
#  logo                   :string
#  header_bg              :string
#  favicon                :string
#  settings               :jsonb
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  style                  :jsonb
#  homepage_info_multiloc :jsonb
#
class AppConfiguration < ApplicationRecord
  include StyleSettings

  mount_base64_uploader :logo, LogoUploader
  mount_base64_uploader :header_bg, AppHeaderBgUploader
  mount_base64_uploader :favicon, FaviconUploader

  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images

  before_validation :sanitize_homepage_info_multiloc

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
  validates :homepage_info_multiloc, multiloc: { presence: false }
  validate :validate_locales, on: :update
  validate :validate_singleton, on: :create

  before_validation :validate_missing_feature_dependencies

  after_update do
    AppConfiguration.instance.reload
  end

  module Settings
    extend CitizenLab::Mixins::SettingsSpecification

    def self.json_schema
      settings_schema = core_settings_json_schema

      extension_features_specs.each do |spec|
        settings_schema['properties'][spec.feature_name] = spec.json_schema
        settings_schema['dependencies'][spec.feature_name] = spec.dependencies if spec.dependencies.present?
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
    private :new # We need a singleton

    def instance
      first!
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

  def feature_activated?(setting_name)
    settings[setting_name]&.values_at('enabled', 'allowed')&.all?
  end

  def has_feature?(f)
    ActiveSupport::Deprecation.warn('AppConfiguration#has_feature? is deprecated. Use AppConfiguration#feature_activated? instead.')
    feature_activated?(f)
  end

  def closest_locale_to(locale)
    locale = locale.to_s
    locales = settings.dig('core', 'locales') || []
    locales.any? { |l| l.include?(locale) } ? locales.find { |l| l.include?(locale) } : locales.first
  end

  def public_settings
    @public_settings ||= SettingsService.new.remove_private_settings(settings, Settings.json_schema)
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

  def sanitize_homepage_info_multiloc
    return if homepage_info_multiloc.blank?

    service = SanitizationService.new
    self.homepage_info_multiloc = service.sanitize_multiloc(
      homepage_info_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.homepage_info_multiloc = service.remove_multiloc_empty_trailing_tags homepage_info_multiloc
    self.homepage_info_multiloc = service.linkify_multiloc homepage_info_multiloc
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

AppConfiguration.include_if_ee('MultiTenancy::Extensions::AppConfiguration')
