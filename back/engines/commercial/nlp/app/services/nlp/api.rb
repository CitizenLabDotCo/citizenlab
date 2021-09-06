# frozen_string_literal: true

require 'httparty'

module NLP
  class Api
    include HTTParty

    LONG_TIMEOUT = 2 * 60 # 2 minutes

    delegate :post, :base_uri, :get, to: :class

    def initialize(base_uri = ENV.fetch('CL2_NLP_HOST'))
      base_uri(base_uri)
    end

    def update_tenant(dump)
      post(
        '/v1/tenants',
        body: dump.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
    end

    def similarity(tenant_id, idea_id, locale, options = {})
      options[:locale] = locale
      resp = get(
        "/v1/tenants/#{tenant_id}/ideas/#{idea_id}/similarity",
        body: options.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      return JSON.parse(resp.body)['data'] if resp.success?
    end

    def clustering(tenant_id, locale, options = {})
      body = { locale: locale }
      body[:idea_ids] = options[:idea_ids] if options[:idea_ids]
      body[:n_clusters] = options[:n_clusters] if options[:n_clusters]
      body[:max_depth] = options[:max_depth] if options[:max_depth]

      resp = post(
        "/v1/tenants/#{tenant_id}/ideas/clustering",
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def ideas_classification(tenant_id, locale)
      get(
        "/v1/tenants/#{tenant_id}/#{locale}/ideas/classification",
        timeout: LONG_TIMEOUT
      )
    end

    def summarize(texts, locale, options = {})
      body = {
        **options,
        texts: texts,
        locale: locale
      }
      resp = post(
        '/v1/summarization',
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def tag_suggestions(body)
      resp = post(
        '/v2/tag_suggestions',
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def project_tag_suggestions(locale, tenant_id, project_id, max_number_of_suggestions = 25)
      resp = post(
        "/v2/tenants/#{tenant_id}/project/#{project_id}/ideas/tag_suggestions",
        body: {
          max_number_of_suggestions: max_number_of_suggestions,
          locale: locale
        }.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def zeroshot_classification(body)
      resp = post(
        '/v2/zeroshot_classification',
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    def cancel_task(task_id)
      resp = get(
        "/v2/async_api/cancel/#{task_id}",
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      resp.code
    end

    def status_task(task_id)
      resp = get(
        "/v2/async_api/status/#{task_id}",
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end

    # @param [String] tenant_id
    # @param [String] project_id
    # @param [String] locale
    # @param [Integer] max_nodes
    # @param [Integer] min_degree
    # @return [String] task_id
    # rubocop:disable Metrics/MethodLength
    def text_network_analysis(tenant_id, project_id, locale, max_nodes: nil, min_degree: nil)
      body = {
        locale: locale,
        max_nodes: max_nodes,
        min_degree: min_degree
      }.compact

      response = post(
        "/v2/tenants/#{tenant_id}/project/#{project_id}/ideas/text_network_analysis",
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )

      raise ClErrors::TransactionError.new(error_key: response['code']) unless response.success?

      response.parsed_response.dig('data', 'task_id')
    end
    # rubocop:enable Metrics/MethodLength
  end
end

NLP::Api.include_if_ee 'FlagInappropriateContent::Extensions::NLP::Api'
