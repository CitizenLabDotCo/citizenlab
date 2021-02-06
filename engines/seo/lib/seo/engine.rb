module Seo
  class Engine < ::Rails::Engine
    isolate_namespace Seo

    Seo::ApplicationSubscriber.listen
  end
end
