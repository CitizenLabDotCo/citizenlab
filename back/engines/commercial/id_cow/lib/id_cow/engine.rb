# frozen_string_literal: true

module IdCow
  class Engine < ::Rails::Engine
    isolate_namespace IdCow

    config.to_prepare do
      IdMethod.add_method(
        CowVerification.new
      )
    end
  end
end
