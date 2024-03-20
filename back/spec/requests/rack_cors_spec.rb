# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Rack::Cors' do
  context 'when any origin is allowed' do
    let(:app) do
      Rack::Cors.new(Cl2Back::Application) do
        allow do
          origins '*'
          resource '*', headers: :any, methods: %i[get post put patch delete options head]
        end
      end
    end

    it 'allows requests from any origin' do
      headers = {
        'HTTP_ORIGIN' => 'https://www.some-origin.com'
      }
      request = Rack::MockRequest.new(app)
      response = request.get('/web_api/v1/app_configuration', headers)

      expect(response.headers['Access-Control-Allow-Origin']).to eq('*')
    end
  end

  context 'when no origin is allowed' do
    let(:app) do
      Rack::Cors.new(Cl2Back::Application) do
        allow do
          origins []
          resource '*', headers: :any, methods: %i[get post put patch delete options head]
        end
      end
    end

    it 'allows requests from any origin' do
      headers = {
        'HTTP_ORIGIN' => 'https://www.some-origin.com'
      }
      request = Rack::MockRequest.new(app)
      response = request.get('/web_api/v1/app_configuration', headers)

      expect(response.headers['Access-Control-Allow-Origin']).to be_nil
    end
  end
end
