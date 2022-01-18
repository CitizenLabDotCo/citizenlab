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
    rescue KeyError => e
      raise MissingBaseUriError if e.key == 'MATOMO_HOST'
      raise MissingAuthorizationTokenError if e.key == 'MATOMO_AUTHORIZATION_TOKEN'
      raise
    end

    # Sends as many `PrivacyManager.deleteDataSubjects` requests as necessary
    # to remove all user data from Matomo.
    # @param [String] user_id
    # @return [Hash,NilClass] Summary of deleted data by aggregating results
    #   from the different `PrivacyManager.deleteDataSubjects` requests. `nil`
    #   if no data was found for this user.
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

    # Deletes raw visit information. If successful, the response payload
    # indicates the amount of data that has been deleted. It looks like:
    #   {
    #     "log_visit"=>0,
    #     "log_link_visit_action"=>0,
    #     "log_conversion_item"=>0,
    #     "log_conversion"=>0
    #   }
    # Unfortunately, this endpoint is not documented so it's difficult to
    # assign precise meaning to those numbers.
    #
    # @param [Array<Hash>] visits
    # @return [HTTParty::Response]
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

    # We had to come up with our own encoding method because the HTTParty
    # serializer produces: 
    #   `visits[][idsite]=value&visits[][idvisit]=value&...`
    # but the Matomo API expects an index:
    #   `visits[0][idsite]=value&visits[0][idvisit]=value&...`
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
    class MissingAuthorizationTokenError < RuntimeError; end
    class MissingBaseUriError < RuntimeError; end
  end
end
