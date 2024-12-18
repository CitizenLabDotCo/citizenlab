# frozen_string_literal: true

module IdGentRrn
  class Engine < ::Rails::Engine
    isolate_namespace IdGentRrn

    config.to_prepare do
      IdMethod.add_method('gent_rrn', GentRrnVerification.new)
    end
  end
end
