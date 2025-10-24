# frozen_string_literal: true

module CustomIdMethods
  class Engine < ::Rails::Engine
    isolate_namespace CustomIdMethods

    # Sharing the factories to make them accessible to the main app / other engines.
    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

    config.to_prepare do
      CustomIdMethods::AllMethods::AUTH_AND_VERIFICATION_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        AuthenticationService.add_method(instance.name, instance)
        Verification.add_method(instance)
      end

      CustomIdMethods::AllMethods::VERIFICATION_ONLY_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        Verification.add_method(instance)
      end

      CustomIdMethods::AllMethods::AUTH_ONLY_METHODS.each do |method|
        instance = "CustomIdMethods::#{method}".constantize.new
        AuthenticationService.add_method(instance.name, instance)
      end

      AppConfiguration::Settings.add_feature(CustomIdMethods::FeatureSpecification)

      # TODO: Change this to be in the verification settings for NemlogIn
      AppConfiguration::Settings.add_feature(CustomIdMethods::NemlogIn::KkiLocationApiFeatureSpecification)
    end
  end
end
