# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Omniauth Callback', document: false do
  before { header 'Content-Type', 'application/json' }

  post '/auth/failure' do
    example_request 'Redirect to failure URL' do
      expect(status).to eq(302)
      expect(response_headers['Location']).to include('/authentication-error')
    end
  end
end
