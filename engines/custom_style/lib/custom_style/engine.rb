module CustomStyle
  class Engine < ::Rails::Engine
    isolate_namespace CustomStyle
    config.generators.api_only = true
  end
end
