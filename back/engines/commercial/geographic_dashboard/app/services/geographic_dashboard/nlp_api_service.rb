module GeographicDashboard
  class NLPApiService < ::NLP::API
    def geotag(tenant_id, text, locale, options = {})
      body = options.merge(text: text, locale: locale)
      resp = post(
        "/v1/tenants/#{tenant_id}/geotagging",
        body: body.to_json,
        headers: { 'Content-Type' => 'application/json' },
        timeout: LONG_TIMEOUT
      )
      raise ClErrors::TransactionError.new(error_key: resp['code']) unless resp.success?

      resp.parsed_response['data']
    end
  end
end
