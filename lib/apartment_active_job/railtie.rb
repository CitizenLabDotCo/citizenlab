module ApartmentActiveJob
  class Railtie < Rails::Railtie
    extend ActiveSupport::Autoload

    autoload :MonkeyPatches, 'apartment_que/monkey_patches'

    config.after_initialize do
      ActiveJob::Base.prepend(
        ApartmentActiveJob::MonkeyPatches::ActiveJob::Base
      )
    end
  end
end
