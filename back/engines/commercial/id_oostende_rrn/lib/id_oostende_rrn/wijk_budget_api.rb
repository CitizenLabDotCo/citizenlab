# frozen_string_literal: true

module IdOostendeRrn
  class WijkBudgetApi
    include HTTParty
    debug_output $stdout if Rails.env.development? || Rails.env.test?

    def initialize(api_key:, environment:)
      @api_key = api_key
      # Only one address provided by Oostende thus far.
      # rubocop:disable Lint/DuplicateBranch
      @domain = case environment
      when 'dv'
        'wapaza-wijkprikkelsapi-01.azurewebsites.net'
      when 'qa'
        'wapaza-wijkprikkelsapi-01.azurewebsites.net'
      when 'production'
        'wapazp-wijkprikkelsapi-01.azurewebsites.net'
      else
        raise "Unsupported environment #{environment} for IdOostendeRrn::WijkBudgetApi.new"
      end
      # rubocop:enable Lint/DuplicateBranch
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
      "https://#{@domain}/services/wijkbudget-api/v1/api"
    end
  end
end
