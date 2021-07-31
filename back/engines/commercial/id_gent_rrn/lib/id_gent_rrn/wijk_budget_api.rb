module IdGentRrn
  class WijkBudgetApi
    include HTTParty
    debug_output $stdout if Rails.env.development? || Rails.env.test?

    base_uri 'https://unknown.domain/services/wijkbudget-api/v1/api'

    def initialize api_key
      @api_key = api_key
    end

    def verificatie rrn
      self.class.get(
        "/WijkBudget/verificatie/#{rrn}",
        headers: authorized_headers
      )
    end

    private 

    def authorized_headers
      {
        'apiKey' => @api_key
      }
    end
  end
end