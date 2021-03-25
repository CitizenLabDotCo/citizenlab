module PublicApi
  class Engine < ::Rails::Engine
    isolate_namespace PublicApi
  end
end