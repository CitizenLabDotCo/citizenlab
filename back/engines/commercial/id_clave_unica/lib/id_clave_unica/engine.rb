# frozen_string_literal: true

module IdClaveUnica
  class Engine < ::Rails::Engine
    isolate_namespace IdClaveUnica

    config.to_prepare do
      Verification::VerificationService.add_method(
        ClaveUnicaOmniauth.new
      )
    end
  end
end
