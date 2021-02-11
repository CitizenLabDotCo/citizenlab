class WebApi::V1::AppConfigurationSerializer < WebApi::V1::BaseSerializer
  attributes :name, :host

  attribute :logo do |object|
    object.logo && object.logo.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :favicon do |object|
    object.favicon && object.favicon.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :settings do |object|
    object.public_settings
  end
end
