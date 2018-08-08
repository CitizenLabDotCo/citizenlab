class WebApi::V1::TenantSerializer < ActiveModel::Serializer
  attributes :id, :name, :host, :settings, :logo, :header_bg, :favicon

  def logo
    object.logo && object.logo.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def favicon
    object.favicon && object.favicon.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def settings
    object.public_settings
  end
end
