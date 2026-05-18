# frozen_string_literal: true

module IdHoplr
  class Engine < ::Rails::Engine
    isolate_namespace IdHoplr

    config.to_prepare do
      hoplr = HoplrOmniauth.new
      AuthenticationService.add_method('hoplr', hoplr)
      Verification.add_method(hoplr)
    end
  end
end
