# frozen_string_literal: true

module AdminApi
  # This serializer re-creates legacy serialized tenants. Attributes that are
  # no longer part of the Tenant model are obtained from the AppConfiguration
  # singleton.
  #
  # If you already have the companion AppConfiguration object, you can save
  # one DB query using:
  #   AdminApi::TenantSerializer.new(tenant, app_configuration: config)
  class TenantSerializer < ActiveModel::Serializer
    attributes :id, :name, :host, :settings, :style, :logo, :favicon, :created_at
    delegate :host, :settings, :style, to: :configuration

    def logo
      configuration.logo && configuration.logo.versions.to_h { |k, v| [k.to_s, v.url] }
    end

    def favicon
      configuration.favicon && configuration.favicon.versions.to_h { |k, v| [k.to_s, v.url] }
    end

    def configuration
      @configuration ||= instance_options[:app_configuration] || object.configuration
    end
  end
end
