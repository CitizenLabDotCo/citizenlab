# frozen_string_literal: true

module IdBosaFas
  class Engine < ::Rails::Engine
    isolate_namespace IdBosaFas

    config.to_prepare do
      Verification::VerificationService.add_method(
        BosaFasOmniauth.new
      )
    end
  end
end
