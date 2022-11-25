# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class ApiClients < Base
      def run
        PublicApi::ApiClient.create!(
          id: '42cb419a-b1f8-4600-8c4e-fd45cca4bfd9',
          secret: 'Hx7C27lxV7Qszw-zCg9UT-GFRQuxJNffllTpeU262CGabllbyTYwOmpizCygtPIZSwg'
        )
      end
    end
  end
end
