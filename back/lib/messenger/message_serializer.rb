module Messenger
  class MessageSerializer < ActiveJob::Serializers::ObjectSerializer
    def serialize?(argument)
      argument.is_a?(::Messenger::Message)
    end

    def serialize(message)
      super(
        to: message.to,
        from: message.from,
        body: message.body
      ).stringify_keys
    end

    def deserialize(hash)
      ::Messenger::Message.new(hash.symbolize_keys)
    end
  end
end
