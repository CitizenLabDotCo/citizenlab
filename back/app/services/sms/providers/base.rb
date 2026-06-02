# frozen_string_literal: true

module Sms
  module Providers
    class Base
      # @param to [String] phone number in E.164 format
      # @param body [String] message body
      # @return [Hash{Symbol => String}] { message_sid:, status: }
      # @raise [Sms::Error] when the underlying provider rejects the message
      def send(to:, body:)
        raise NotImplementedError
      end
    end
  end
end
