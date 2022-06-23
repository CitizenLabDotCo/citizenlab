# frozen_string_literal: true

module RemoveVendorBranding
  class Engine < ::Rails::Engine
    isolate_namespace RemoveVendorBranding

    config.to_prepare do
      require 'remove_vendor_branding/feature_specification'
      AppConfiguration::Settings.add_feature(RemoveVendorBranding::FeatureSpecification)
    end
  end
end
