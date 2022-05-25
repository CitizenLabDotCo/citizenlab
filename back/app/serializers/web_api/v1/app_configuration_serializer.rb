# frozen_string_literal: true

class WebApi::V1::AppConfigurationSerializer < WebApi::V1::BaseSerializer
  attributes :name, :host, :style

  attribute :logo do |object|
    object.logo && object.logo.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :favicon do |object|
    object.favicon && object.favicon.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :settings, &:public_settings

  attribute :homepage_info_multiloc, if: proc { |object, _|
    object.homepage_info_multiloc.present?
  } do |object|
    TextImageService.new.render_data_images object, :homepage_info_multiloc
  end
end
