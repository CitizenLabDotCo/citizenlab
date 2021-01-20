module ApartmentQue
  class Railtie < Rails::Railtie
    extend ActiveSupport::Autoload

    autoload :MonkeyPatches, 'apartment_que/monkey_patches'

    config.after_initialize do
      ActiveJob::QueueAdapters::QueAdapter::JobWrapper.prepend(
        ApartmentQue::MonkeyPatches::ActiveJob::QueueAdapters::QueAdapter::JobWrapper
      )
      ActiveJob::Base.prepend(
        ApartmentQue::MonkeyPatches::ActiveJob::Base
      )
    end
  end
end
