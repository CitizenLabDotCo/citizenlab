# frozen_string_literal: true

module IdFakeSso
  class Engine < ::Rails::Engine
    isolate_namespace IdFakeSso

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdFakeSso::FeatureSpecification)
      IdMethod.add_method('fake_sso', FakeSsoOmniauth.new)
    end
  end
end
