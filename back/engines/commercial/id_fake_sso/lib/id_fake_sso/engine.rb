# frozen_string_literal: true

module IdFakeSso
  class Engine < ::Rails::Engine
    isolate_namespace IdFakeSso

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFakeSso::FeatureSpecification)

      fake_sso_method = FakeSsoOmniauth.new
      AuthenticationService.add_method('fake_sso', fake_sso_method)
      IdMethod.add_method(fake_sso_method)
    end
  end
end
