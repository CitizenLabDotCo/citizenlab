module Analysis
  module LLM
    class Message
      attr_reader :role, :inputs
      alias content inputs

      def initialize(*inputs, role: 'user')
        @role = role
        @inputs = inputs
      end

      def self.wrap(message)
        case message
        when self then message
        when String then new(message)
        else raise ArgumentError, "Unsupported message type: #{message.class}"
        end
      end
    end
  end
end
