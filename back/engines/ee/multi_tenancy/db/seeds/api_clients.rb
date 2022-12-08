# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class ApiClients < Base
      def run
        PublicApi::ApiClient.create!(
          id: ENV.fetch('PUBLIC_API_CLIENT_ID'),
          secret: ENV.fetch('PUBLIC_API_CLIENT_SECRET')
        )
      end
    end
  end
end
