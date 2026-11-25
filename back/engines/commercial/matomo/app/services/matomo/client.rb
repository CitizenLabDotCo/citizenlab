# frozen_string_literal: true

module Matomo
  class Client
    attr_reader :base_uri, :auth_token

    # How many users +#find_data_subjects+ looks for at once. Their ids are OR-ed in the
    # segment, which is sent in the URL: 50 ids keep it at about 2 KB.
    USERS_PER_REQUEST = 50
    # Matomo turns privacy requests away with a 503 while it is handling too many of them at once.
    # Such a request is sent again after each of these delays (in seconds) before giving up.
    BUSY_RETRY_DELAYS = [2, 4, 8, 16, 32].freeze

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
    # to remove all the data of these users from Matomo. The users are looked up
    # +USERS_PER_REQUEST+ at a time.
    # @param [String,Array<String>] user_ids
    # @param [Array<String>,NilClass] site_ids the sites to search, all sites if blank.
    # @return [Hash,NilClass] Summary of deleted data by aggregating results
    #   from the different `PrivacyManager.deleteDataSubjects` requests. `nil`
    #   if no data was found for these users.
    def delete_user_data(user_ids, site_ids: nil)
      deletes_summary = {}

      Array(user_ids).each_slice(USERS_PER_REQUEST) do |batch|
        # `findDataSubjects` returns at most 401 visits, so this repeats until none are left.
        loop do
          visits_response = retry_when_busy { find_data_subjects(batch, site_ids: site_ids) }
          raise_if_error(visits_response)
          break if visits_response.parsed_response.blank?

          delete_response = retry_when_busy { delete_data_subjects(visits_response.parsed_response) }
          raise_if_error(delete_response)
          deletes_summary.merge!(delete_response.parsed_response) { |_key, v1, v2| v1 + v2 }
          sleep(0.5)
          break if delete_response.parsed_response.values.sum.zero? # nb data points that were deleted
        end
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

    # @param [String,Array<String>] user_ids
    # @param [Array<String>,NilClass] site_ids the sites to search, all sites if blank.
    # @return [HTTParty::Response]
    def find_data_subjects(user_ids, site_ids: nil)
      query = {
        # Searching all sites is much slower: Matomo then scans the visits of every site.
        'idSite' => site_ids.presence&.join(',') || 'all',
        'module' => 'API',
        'method' => 'PrivacyManager.findDataSubjects',
        # A comma ORs the conditions of a segment.
        'segment' => Array(user_ids).map { |user_id| "userId==#{user_id}" }.join(','),
        'format' => 'JSON'
      }

      HTTParty.post(
        @index_php_uri,
        query: query,
        headers: headers,
        body: authorization_body
      )
    end

    # See https://developer.matomo.org/api-reference/reporting-api#Live
    #
    # @param [String] site_id
    # @param [String,nil] period
    # @param [String,nil] date
    # @param [Integer,nil] min_timestamp minimum value of visits' lastActionTimestamp
    # @param [Integer,nil] filter_limit
    # @param [Integer,nil] filter_offset
    # @param [String (frozen)] filter_sort_order 'asc' or 'desc'
    def get_last_visits_details(
      site_id,
      period: nil,
      date: nil,
      min_timestamp: nil,
      filter_limit: nil,
      filter_offset: nil,
      filter_sort_order: 'asc'
    )
      query = {
        'module' => 'API',
        'method' => 'Live.getLastVisitsDetails',
        'idSite' => site_id,
        'period' => period,
        'date' => date,
        'minTimestamp' => min_timestamp,
        'filter_limit' => filter_limit,
        'filter_offset' => filter_offset,
        'filter_sort_order' => filter_sort_order,
        'format' => 'JSON'
      }.compact

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

    def raise_if_error(response)
      return unless error?(response)

      message = begin
        response.parsed_response.fetch('message')
      rescue StandardError
        response.parsed_response.to_s
      end

      raise MatomoApiError, message
    end

    private

    def retry_when_busy
      BUSY_RETRY_DELAYS.each do |delay|
        response = yield
        return response unless response.code == 503

        # The jitter spreads out the retries of jobs that were turned away at the same time.
        sleep(delay * rand(1.0..1.5))
      end

      yield
    end

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
      return true unless response.success?

      # A response can be an error even if `success?` is true because Matomo API tends to
      # return status codes of 200 even for failed requests. To be sure, we have to
      # check if the payload contains an error message.
      response.parsed_response['result'] == 'error'
    rescue TypeError
      false
    end

    class MatomoApiError < RuntimeError; end
    class MissingAuthorizationTokenError < RuntimeError; end
    class MissingBaseUriError < RuntimeError; end
  end
end
