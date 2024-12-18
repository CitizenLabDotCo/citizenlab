# frozen_string_literal: true

require 'omniauth-auth0'

module IdAuth0
  class Engine < ::Rails::Engine
    isolate_namespace IdAuth0

    config.to_prepare do
      IdMethod.add_method(
        Auth0Omniauth.new
      )
    end
  end
end
