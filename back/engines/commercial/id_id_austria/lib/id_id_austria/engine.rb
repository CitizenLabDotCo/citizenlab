# frozen_string_literal: true

module IdIdAustria
  class Engine < ::Rails::Engine
    isolate_namespace IdIdAustria

    config.to_prepare do
      id_austria = IdAustriaOmniauth.new
      Verification.add_method(id_austria)
      AuthenticationService.add_method('id_austria', id_austria)
    end
  end
end
