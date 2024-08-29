# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Rack::Cors' do
  context 'when any origin is allowed' do
    let(:app) do
      Rack::Cors.new(Cl2Back::Application) do
        allow do
          origins ['*']
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

  context 'when a specific origin is allowed' do
    let(:app) do
      Rack::Cors.new(Cl2Back::Application) do
        allow do
          origins ['https://www.allowed-origin.com']
          resource '*', headers: :any, methods: %i[get post put patch delete options head]
        end
      end
    end

    it 'allows requests from the allowed origin' do
      headers = {
        'HTTP_ORIGIN' => 'https://www.allowed-origin.com'
      }
      request = Rack::MockRequest.new(app)
      response = request.get('/web_api/v1/app_configuration', headers)

      expect(response.headers['Access-Control-Allow-Origin']).to eq('https://www.allowed-origin.com')
    end

    it 'does not allow requests from another origin' do
      headers = {
        'HTTP_ORIGIN' => 'https://www.not-allowed-origin.com'
      }
      request = Rack::MockRequest.new(app)
      response = request.get('/web_api/v1/app_configuration', headers)

      expect(response.headers['Access-Control-Allow-Origin']).to be_blank
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

      expect(response.headers['Access-Control-Allow-Origin']).to be_blank
    end
  end
end
