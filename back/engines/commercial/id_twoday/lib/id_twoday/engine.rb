# frozen_string_literal: true

module IdTwoday
  class Engine < ::Rails::Engine
    isolate_namespace IdTwoday

    config.to_prepare do
      twoday = TwodayOmniauth.new
      Verification.add_method(twoday)
      AuthenticationService.add_method('twoday', twoday)
    end
  end
end
