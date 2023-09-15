# frozen_string_literal: true

class WebApi::V1::AppConfigurationSerializer < WebApi::V1::BaseSerializer
  attributes :name, :host, :style, :created_at

  attribute :logo do |object|
    object.logo && object.logo.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :favicon do |object|
    object.favicon && object.favicon.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :settings, &:public_settings
end
