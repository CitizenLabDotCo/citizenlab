# frozen_string_literal: true

module IdBogus
  class Engine < ::Rails::Engine
    isolate_namespace IdBogus

    config.to_prepare do
      IdMethod.add_method(
        BogusVerification.new
      )
    end
  end
end
