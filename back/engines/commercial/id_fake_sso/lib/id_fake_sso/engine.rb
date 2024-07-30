# frozen_string_literal: true

module FakeSso
  class Engine < ::Rails::Engine
    isolate_namespace FakeSso

    config.to_prepare do
      AuthenticationService.add_method('fake_sso', FakeSsoOmniauth.new)
    end
  end
end
