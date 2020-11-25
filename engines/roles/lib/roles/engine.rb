module Roles
  class Engine < ::Rails::Engine
    isolate_namespace Roles

    require 'has_roles'

    config.roles_engine = Roles
    config.autoload_paths += %W[#{config.root}/lib]
  end
end
