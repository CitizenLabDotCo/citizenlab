# frozen_string_literal: true

module IdRmUnify
  class Engine < ::Rails::Engine
    isolate_namespace IdRmUnify

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdRmUnify::FeatureSpecification)

      rm_unify_omniauth = RmUnifyOmniauth.new
      AuthenticationService.add_method('rm_unify', rm_unify_omniauth)
      Verification.add_method(rm_unify_omniauth)
    end
  end
end
