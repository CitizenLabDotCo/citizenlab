# frozen_string_literal: true

module Callable
  ## Autoload Callable
  class Railtie < ::Rails::Railtie
    config.eager_load_namespaces << Callable
  end
end
