# frozen_string_literal: true

require 'bunny'

module CitizenLab
  module Bunny
    # @param [String] rabbitmq_uri
    # @param [Integer] max_retries
    # @param [Integer] retry_delay in seconds
    # @return [Bunny::Session] A bunny session with the connection already started
    def self.connect(rabbitmq_uri, max_retries: 10, retry_delay: 5)
      retries ||= 0
      ::Bunny.new(rabbitmq_uri, automatically_recover: true, continuation_timeout: 20_000).start
    rescue ::Bunny::TCPConnectionFailedForAllHosts => e
      retries += 1
      raise e if retries >= max_retries

      sleep(retry_delay)
      retry
    end
  end
end
