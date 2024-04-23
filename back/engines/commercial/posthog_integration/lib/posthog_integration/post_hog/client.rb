# frozen_string_literal: true

require 'http'

module PosthogIntegration
  module PostHog
    class Client
      DEFAULT_BASE_URI = 'https://eu.posthog.com'

      def initialize(base_uri: nil, api_key: nil, project_id: nil)
        @base_uri = base_uri || ENV.fetch('POSTHOG_HOST', DEFAULT_BASE_URI)
        @base_uri = @base_uri.chomp('/')

        @api_key = api_key || ENV.fetch('POSTHOG_API_KEY', nil)

        @project_id = project_id
        assert_project_id!
      end

      def persons(**params)
        http.get("#{@base_uri}/api/projects/#{@project_id}/persons", params: params)
      end

      def delete_person(id, retries: 0)
        response = http.delete("#{@base_uri}/api/projects/#{@project_id}/persons/#{id}")
        if response.status.code != 429 || retries <= 0
          response
        else
          # Retry after waiting between 1 and 5 minutes
          sleep_time = rand(60..300)
          sleep(sleep_time)
          delete_person(id, retries: retries - 1)
        end
      end

      def delete_person_by_distinct_id(distinct_id, retries: 0)
        response = persons(distinct_id: distinct_id)
        raise_if_error!(response)

        results = response.parse['results']

        case results.size
        when 0
          nil
        when 1
          person_id = results.first['id']
          delete_response = delete_person(person_id, retries: retries)
          raise_if_error!(delete_response)

          person_id
        else
          raise <<~MSG.squish
            Unexpected number of persons with distinct_id #{distinct_id.inspect}. 
            Expected 0 or 1, got #{results.size}.
          MSG
        end
      end

      private

      def http
        HTTP
          .auth(authorization_header)
          .accept('application/json')
      end

      def authorization_header
        "Bearer #{@api_key}"
      end

      def assert_project_id!
        return if @project_id

        raise <<~MSG
          The PostHog project ID is missing. You should either use the `project_id`
          parameter or set a default project ID on the client: 
          
          > client.default_project_id = '123'
        MSG
      end

      def raise_if_error!(response)
        return if !response.status.client_error? && !response.status.server_error?

        raise ApiError, response.to_s
      end

      class ApiError < RuntimeError; end
    end
  end
end
