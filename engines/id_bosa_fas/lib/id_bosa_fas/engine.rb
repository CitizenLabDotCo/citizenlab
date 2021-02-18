# frozen_string_literal: true

module IdBosaFas
  class Engine < ::Rails::Engine
    isolate_namespace IdBosaFas

    config.after_initialize do
      Verification::VerificationService.prepend(::IdBosaFas::MonkeyPatches::VerificationService)
    end
  end
end
