require 'messenger/base'
require 'messenger/message'
require 'messenger/delivery_job'
require 'messenger/message_serializer'

module Messenger
  class Railtie < ::Rails::Railtie
    config.active_job.custom_serializers << ::Messenger::MessageSerializer
  end
end
