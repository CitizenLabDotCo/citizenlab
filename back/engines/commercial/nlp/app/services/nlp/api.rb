# frozen_string_literal: true

require 'httparty'

module NLP
  class Api
    LONG_TIMEOUT = 2 * 60 # 2 minutes

    attr_reader :authorization_token, :base_uri

    def initialize(base_uri: nil, authorization_token: nil)
      @authorization_token = authorization_token || ENV.fetch('NLP_API_TOKEN')
      @base_uri = HTTParty.normalize_base_uri(base_uri || ENV.fetch('NLP_HOST'))
    end

    def update_tenant(dump)
      post('/v1/tenants', dump)
    end

    def similarity(tenant_id, idea_id, locale, options = {})
      body = options.merge(locale: locale)
      path = "/v1/tenants/#{tenant_id}/ideas/#{idea_id}/similarity"
      resp = get(path, body)

      JSON.parse(resp.body)['data'] if resp.success?
    end

    def clustering(tenant_id, locale, options = {})
      body = options.slice(:idea_ids, :n_clusters, :max_depth).merge(locale: locale)
      path = "/v1/tenants/#{tenant_id}/ideas/clustering"
      resp = post(path, body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def ideas_classification(tenant_id, locale)
      get("/v1/tenants/#{tenant_id}/#{locale}/ideas/classification")
    end

    def summarize(texts, locale, options = {})
      body = options.merge(texts: texts, locale: locale)
      resp = post('/v1/summarization', body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def tag_suggestions(body)
      resp = post('/v2/tag_suggestions', body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def tag_suggestions_for_project(locale, tenant_id, project_id, max_number_of_suggestions = 25)
      body = {
        max_number_of_suggestions: max_number_of_suggestions,
        locale: locale
      }

      path = "/v2/tenants/#{tenant_id}/project/#{project_id}/ideas/tag_suggestions"
      resp = post(path, body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def zeroshot_classification(body)
      resp = post('/v2/zeroshot_classification', body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def cancel_task(task_id)
      resp = get("/v2/async_api/cancel/#{task_id}")
      resp.code
    end

    # @param [Array<String>] task_ids
    # @return [HTTParty::Response] HTTP status code
    def cancel_tasks(task_ids)
      body = { ids: task_ids }
      post('/v2/async_api/cancel', body)
    end

    def status_task(task_id)
      resp = get("/v2/async_api/status/#{task_id}")
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    # @param [String] tenant_id
    # @param [String] project_id
    # @param [String] locale
    # @param [Integer] max_nodes
    # @param [Integer] min_degree
    # @return [String] task_id
    def text_network_analysis_for_project(tenant_id, project_id, locale, max_nodes: nil, min_degree: nil)
      body = {
        locale: locale,
        max_nodes: max_nodes,
        min_degree: min_degree
      }.compact

      path = "/v2/tenants/#{tenant_id}/project/#{project_id}/ideas/text_network_analysis"
      response = post(path, body)
      raise ClErrors::TransactionError.new(error_key: response['code']) unless response.success?

      response.parsed_response.dig('data', 'task_id')
    end

    # Create a task to perform text-network analysis for a list of inputs.
    #
    # @param tenant_id [String]
    # @param input_identifiers [Array<String>]
    # @param max_nodes [Integer,nil]
    # @param min_degree [Integer,nil]
    # @return [Hash{String => String}] task identifier by language
    def text_network_analysis(tenant_id, input_identifiers, max_nodes: nil, min_degree: nil)
      body = {
        input_identifiers: input_identifiers,
        max_nodes: max_nodes,
        min_degree: min_degree
      }.compact

      path = "/v2/tenants/#{tenant_id}/text_network_analysis"
      response = post(path, body)
      raise ClErrors::TransactionError.new(error_key: response['code']) unless response.success?

      response.parsed_response['data'].to_h do |task_detail|
        # Use `fetch` to hard fail if the properties are missing.
        [task_detail.fetch('language'), task_detail.fetch('task_id')]
      end
    end

    # @param [String] tenant_id
    # @param [String] text
    # @param [String] locale
    # @return [Array]
    def geotag(tenant_id, text, locale, options = {})
      body = options.merge(text: text, locale: locale)
      resp = post("/v1/tenants/#{tenant_id}/geotagging", body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def toxicity_detection(texts)
      body = { texts: texts }
      resp = post('/v2/toxic_classification', body)
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    private

    def get(path, json = nil)
      options = { timeout: LONG_TIMEOUT, headers: authorization_header, base_uri: base_uri }

      unless json.nil?
        options[:headers]['Content-Type'] = 'application/json'
        options[:body] = json.is_a?(String) ? json : json.to_json
      end

      HTTParty.get(path, options)
    end

    def post(path, json)
      options = {
        body: json.is_a?(String) ? json : json.to_json,
        timeout: LONG_TIMEOUT,
        headers: authorization_header.merge('Content-Type' => 'application/json'),
        base_uri: base_uri
      }

      HTTParty.post(path, options)
    end

    def authorization_header
      { 'Authorization' => "Token #{@authorization_token}" }
    end
  end
end
