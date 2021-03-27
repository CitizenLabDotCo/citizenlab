# frozen_string_literal: true

module IdCow
  class Engine < ::Rails::Engine
    isolate_namespace IdCow

    config.to_prepare do
      Verification::VerificationService.add_method(
        CowVerification.new
      )
    end
  end
end
