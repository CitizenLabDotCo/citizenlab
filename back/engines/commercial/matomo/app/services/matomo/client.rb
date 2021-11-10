# frozen_string_literal: true

module Matomo
  class Client
    attr_reader :base_uri, :auth_token

    # @param [String] base_uri
    # @param [String] auth_token
    def initialize(base_uri = nil, auth_token = nil)
      @base_uri = (base_uri || ENV.fetch('MATOMO_HOST')).chomp('/')
      @index_php_uri = "#{@base_uri}/index.php"
      @auth_token = auth_token || ENV.fetch('MATOMO_AUTHORIZATION_TOKEN')
    end

    def delete_user_data(user_id)
      deletes_summary = {}

      loop do
        visits_response = find_data_subjects(user_id)
        raise_if_error(visits_response)
        break if visits_response.parsed_response.blank?

        delete_response = delete_data_subjects(visits_response.parsed_response)
        raise_if_error(delete_response)
        deletes_summary.merge!(delete_response.parsed_response) { |_key, v1, v2| v1 + v2 }
        break if delete_response.parsed_response.values.sum.zero? # nb data points that were deleted
      end

      deletes_summary.presence
    end

    def delete_data_subjects(visits)
      encoded_visits = x_www_form_urlencode_visits(visits)
      body = encoded_visits.merge(authorization_body)

      query = {
        'module' => 'API',
        'method' => 'PrivacyManager.deleteDataSubjects',
        'format' => 'JSON'
      }

      HTTParty.post(
        @index_php_uri,
        query: query,
        headers: headers,
        body: body
      )
    end

    # @param [String] user_id
    # @return [HTTParty::Response]
    def find_data_subjects(user_id)
      query = {
        'idSite' => 'all',
        'module' => 'API',
        'method' => 'PrivacyManager.findDataSubjects',
        'segment' => "userId==#{user_id}",
        'format' => 'JSON'
      }

      HTTParty.post(
        @index_php_uri,
        query: query,
        headers: headers,
        body: authorization_body
      )
    end

    def headers
      { 'Content-Type' => 'application/x-www-form-urlencoded' }
    end

    def authorization_body
      { 'token_auth' => auth_token }
    end

    private

    def format_visit(visit)
      {
        idsite: visit.fetch('idSite'),
        idvisit: visit.fetch('idVisit')
      }
    end

    def x_www_form_urlencode_visits(visits)
      visits.flat_map.with_index do |visit, i|
        [
          ["visits[#{i}][idsite]", visit['idSite']],
          ["visits[#{i}][idvisit]", visit['idVisit']]
        ]
      end.to_h
    end

    def error?(response)
      response.parsed_response['result'] == 'error'
    rescue StandardError
      false
    end

    def raise_if_error(response)
      raise MatomoApiError, response.parsed_response['message'] if error?(response)
    end

    class MatomoApiError < RuntimeError; end
  end
end
