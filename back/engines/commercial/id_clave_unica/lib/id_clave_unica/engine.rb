# frozen_string_literal: true

module IdClaveUnica
  class Engine < ::Rails::Engine
    isolate_namespace IdClaveUnica

    config.to_prepare do
      cu = ClaveUnicaOmniauth.new
      AuthenticationService.add_method('clave_unica', cu)
      Verification::VerificationService.add_method(cu)
    end
  end
end
