# frozen_string_literal: true

module IdCriipto
  class Engine < ::Rails::Engine
    isolate_namespace IdCriipto

    config.to_prepare do
      Verification::VerificationService.add_method(
        CriiptoOmniauth.new
      )
    end
  end
end
