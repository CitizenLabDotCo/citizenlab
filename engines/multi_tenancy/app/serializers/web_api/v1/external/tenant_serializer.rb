class WebApi::V1::External::TenantSerializer < ActiveModel::Serializer
  attributes :id, :name, :host, :settings, :style, :logo, :header_bg
  delegate :host, :settings, :style, to: :configuration

  def logo
    configuration.logo && configuration.logo.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def header_bg
    configuration.header_bg && configuration.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  private

  def configuration
    @configuration ||= instance_options[:app_configuration] || object.configuration
  end
end
