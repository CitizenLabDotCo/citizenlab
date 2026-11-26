# frozen_string_literal: true

require 'http'

module PosthogIntegration
  module PostHog
    class Client
      DEFAULT_BASE_URI = 'https://eu.posthog.com'
      # See the persons bulk_delete endpoint of the PostHog API.
      BULK_DELETE_LIMIT = 1000

      def initialize(base_uri: nil, api_key: nil, project_id: nil)
        @base_uri = base_uri || ENV.fetch('POSTHOG_HOST', DEFAULT_BASE_URI)
        @base_uri = @base_uri.chomp('/')

        @api_key = api_key || ENV.fetch('POSTHOG_API_KEY', nil)

        @project_id = project_id
        assert_project_id!
      end

      # Deletes the persons with the given distinct ids, without looking them up first. Distinct
      # ids that don't match a person are ignored. Their events are kept. PostHog accepts at most
      # +BULK_DELETE_LIMIT+ ids per request.
      #
      # @param [Array<String>] distinct_ids
      def delete_persons_by_distinct_ids(distinct_ids, retries: 0)
        distinct_ids.each_slice(BULK_DELETE_LIMIT) do |slice|
          response = retry_request(retries: retries) do
            http.post("#{@base_uri}/api/projects/#{@project_id}/persons/bulk_delete", json: { distinct_ids: slice })
          end
          raise_if_error!(response)
        end
      end

      private

      def retry_request(retries: 0, &)
        response = yield
        return response if response.status.code != 429 || retries <= 0

        # Retry after 30s–2min. `&` forwards the block so the recursion can still yield.
        sleep rand(30..120)
        retry_request(retries: retries - 1, &)
      end

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
