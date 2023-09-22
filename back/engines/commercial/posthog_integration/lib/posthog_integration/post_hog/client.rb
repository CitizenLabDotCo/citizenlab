# frozen_string_literal: true

require 'http'

module PosthogIntegration
  module PostHog
    class Client
      DEFAULT_BASE_URI = 'https://eu.posthog.com'

      attr_accessor :default_project_id

      delegate :raise_if_error, to: :class

      def initialize(base_uri: nil, api_key: nil)
        @base_uri = base_uri || ENV.fetch('POSTHOG_HOST', DEFAULT_BASE_URI)
        @base_uri = @base_uri.chomp('/')

        @api_key = api_key || ENV.fetch('POSTHOG_API_KEY', nil)
      end

      def persons(project_id: default_project_id, **params)
        missing_project_id! unless project_id

        http.get("#{@base_uri}/api/projects/#{project_id}/persons", params: params)
      end

      def delete_person(id, project_id: default_project_id)
        missing_project_id! unless project_id

        http.delete("#{@base_uri}/api/projects/#{project_id}/persons/#{id}")
      end

      def delete_person_by_distinct_id(distinct_id, project_id: default_project_id)
        missing_project_id! unless project_id

        response = persons(project_id: project_id, distinct_id: distinct_id)
        raise_if_error(response)

        results = response.parse['results']

        case results.size
        when 0
          nil
        when 1
          person_id = results.first['id']
          delete_response = delete_person(person_id, project_id: project_id)
          raise_if_error(delete_response)

          person_id
        else
          raise <<~MSG.squish
            Unexpected number of persons with distinct_id #{distinct_id.inspect}. 
            Expected 0 or 1, got #{results.size}.
          MSG
        end
      end

      def self.raise_if_error(response)
        status = response.status
        return unless status.client_error? || status.server_error?

        raise ApiError, response.to_s
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

      def missing_project_id!
        raise <<~MSG
          The PostHog project ID is missing. You should either use the `project_id`
          parameter or set a default project ID on the client: 
          
          > client.default_project_id = '123'
        MSG
      end

      class ApiError < RuntimeError; end
    end
  end
end
