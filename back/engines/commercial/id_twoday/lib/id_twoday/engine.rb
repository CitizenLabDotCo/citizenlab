# frozen_string_literal: true

module IdTwoday
  class Engine < ::Rails::Engine
    isolate_namespace IdTwoday

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdTwoday::FeatureSpecification)

      twoday = TwodayOmniauth.new
      Verification.add_method(twoday)
      AuthenticationService.add_method('twoday', twoday)
    end
  end
end
