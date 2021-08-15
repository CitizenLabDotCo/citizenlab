module IdGentRrn
  class WijkBudgetApi
    include HTTParty
    debug_output $stdout if Rails.env.development? || Rails.env.test?

    def initialize(api_key:, environment:)
      @api_key = api_key
      @domain = case environment
                when 'dv'
                  'apidgdv.gent.be'
                when 'qa'
                  'apidgqa.gent.be'
                when 'production'
                  'apidg.gent.be'
                else
                  raise "Unsupported environment #{environment} for IdGentRrn::WijkBudgetApi.new"
                end
    end

    def verificatie(rrn)
      self.class.get(
        "/WijkBudget/verificatie/#{rrn}",
        headers: authorized_headers,
        base_uri: base_uri
      )
    end

    private

    def authorized_headers
      {
        'apiKey' => @api_key
      }
    end

    def base_uri
      "https://#{@domain}/services/wijkbudget/v1"
    end
  end
end
