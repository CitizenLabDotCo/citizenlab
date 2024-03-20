# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Rack::Cors' do
  it 'does not permit cross-origin requests' do
    headers = { HTTP_ORIGIN: 'https://www.test.com' }
    get('/web_api/v1/app_configuration', headers: headers)

    expect(response.headers['Access-Control-Allow-Origin']).to eq('*')
  end
end
