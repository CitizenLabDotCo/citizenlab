# frozen_string_literal: true

module Frontend
  class Engine < ::Rails::Engine
    isolate_namespace Frontend
  end
end
