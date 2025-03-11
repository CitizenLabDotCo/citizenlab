# frozen_string_literal: true

module IdBosaFas
  class Engine < ::Rails::Engine
    isolate_namespace IdBosaFas

    config.to_prepare do
      IdMethod.add_method('bosa_fas', BosaFasOmniauth.new)
    end
  end
end
