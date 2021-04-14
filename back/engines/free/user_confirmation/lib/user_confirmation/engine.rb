module UserConfirmation
  class Engine < ::Rails::Engine
    isolate_namespace UserConfirmation

    config.to_prepare do
      require 'user_confirmation/feature_specifications/email_confirmation'
      require 'user_confirmation/feature_specifications/phone_confirmation'
      AppConfiguration::Settings.add_feature(UserConfirmation::FeatureSpecifications::EmailConfirmation)
      AppConfiguration::Settings.add_feature(UserConfirmation::FeatureSpecifications::PhoneConfirmation)
    end
  end
end
