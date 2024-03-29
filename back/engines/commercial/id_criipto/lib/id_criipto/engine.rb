# frozen_string_literal: true

module IdCriipto
  class Engine < ::Rails::Engine
    isolate_namespace IdCriipto

    config.to_prepare do
      criipto = CriiptoOmniauth.new
      Verification.add_method(criipto)
      AuthenticationService.add_method('criipto', criipto)
    end
  end
end
