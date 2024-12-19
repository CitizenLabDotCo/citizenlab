# frozen_string_literal: true

module IdFacebook
  class Engine < ::Rails::Engine
    isolate_namespace IdFacebook

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFacebook::FeatureSpecification)
      IdMethod.add_method('facebook', FacebookOmniauth.new) # TODO: JS - can we change this to 'id_facebook'?
    end
  end
end
