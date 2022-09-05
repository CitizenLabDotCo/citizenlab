# frozen_string_literal: true

module IdGentRrn
  class Engine < ::Rails::Engine
    isolate_namespace IdGentRrn

    config.to_prepare do
      Verification::VerificationService.add_method(
        GentRrnVerification.new
      )
    end
  end
end
