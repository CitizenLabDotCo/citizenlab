# frozen_string_literal: true


# This serializer is defined directly in the +WebApi+ namespace instead of the
# +MultiTenancy+ namespace (`MultiTenancy::WebApi::...`) because +Notification+
# (and maybe other places) is using dynamic dispatching to pick the right
# serializer:
#   serializer = "WebApi::V1::External::#{self.class.name}Serializer".constantize
# So this serializer needs to be defined alongside the other serializer of the
# core application.
module WebApi
  module V1
    module External
      class TenantSerializer < ActiveModel::Serializer
        attributes :id, :name, :host, :settings, :style, :logo, :header_bg
        delegate :host, :settings, :style, to: :configuration

        def logo
          configuration.logo && configuration.logo.versions.map { |k, v| [k.to_s, v.url] }.to_h
        end

        def header_bg
          configuration.header_bg && configuration.header_bg.versions.map { |k, v| [k.to_s, v.url] }.to_h
        end

        def configuration
          @configuration ||= instance_options[:app_configuration] || object.configuration
        end
      end
    end
  end
end
