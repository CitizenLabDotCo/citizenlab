# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Plugins' do
  explanation 'Returns proxy URLs for active plugin front-end entries'

  before do
    header 'Content-Type', 'application/json'
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['plugins'] = {
      allowed: true,
      enabled: true,
      active_plugins: [
        { 'url' => 'https://example.com/plugins/hello-world/manifest.json' },
        { 'url' => 'https://example.com/plugins/other-plugin/manifest.json' }
      ]
    }
    configuration.save!
  end

  get 'web_api/v1/plugins/front_entries' do
    example 'List proxy URLs for active plugin front-end entries' do
      stub_request(:get, 'https://example.com/plugins/hello-world/manifest.json')
        .to_return(
          status: 200,
          body: {
            name: 'Hello world',
            version: '0.1',
            front: { entry: 'front/dist/index.iife.js' }
          }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      stub_request(:get, 'https://example.com/plugins/other-plugin/manifest.json')
        .to_return(
          status: 200,
          body: {
            name: 'Other plugin',
            version: '1.0',
            front: { entry: 'dist/bundle.js' }
          }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )

      do_request

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].length).to eq 2
      expect(json_response[:data][0][:attributes][:url]).to include '/web_api/v1/plugins/0/front_entry'
      expect(json_response[:data][1][:attributes][:url]).to include '/web_api/v1/plugins/1/front_entry'
      expect(json_response[:data][0][:type]).to eq 'plugin_front_entry'
    end

    example 'Skips plugins with unreachable manifests' do
      stub_request(:get, 'https://example.com/plugins/hello-world/manifest.json')
        .to_return(
          status: 200,
          body: {
            name: 'Hello world',
            front: { entry: 'front/dist/index.iife.js' }
          }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      stub_request(:get, 'https://example.com/plugins/other-plugin/manifest.json')
        .to_return(status: 404)

      do_request

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].length).to eq 1
      expect(json_response[:data][0][:attributes][:url]).to include '/web_api/v1/plugins/0/front_entry'
    end

    example 'Skips plugins with no front entry in manifest' do
      stub_request(:get, 'https://example.com/plugins/hello-world/manifest.json')
        .to_return(
          status: 200,
          body: { name: 'Backend only', back: { entry: 'back/index.wasm' } }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      stub_request(:get, 'https://example.com/plugins/other-plugin/manifest.json')
        .to_return(
          status: 200,
          body: { name: 'Other', front: { entry: 'dist/bundle.js' } }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )

      do_request

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].length).to eq 1
      expect(json_response[:data][0][:attributes][:url]).to include '/web_api/v1/plugins/1/front_entry'
    end

    example 'Returns empty list when no plugins are configured' do
      configuration = AppConfiguration.instance
      settings = configuration.settings
      settings['plugins'] = { allowed: true, enabled: true, active_plugins: [] }
      configuration.save!

      do_request

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data]).to eq []
    end
  end

  get 'web_api/v1/plugins/:id/front_entry' do
    parameter :id, 'The plugin index', required: true

    example 'Proxy a plugin front-end entry file' do
      stub_request(:get, 'https://example.com/plugins/hello-world/manifest.json')
        .to_return(
          status: 200,
          body: { name: 'Hello world', front: { entry: 'front/dist/index.iife.js' } }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      stub_request(:get, 'https://example.com/plugins/other-plugin/manifest.json')
        .to_return(status: 404)
      stub_request(:get, 'https://example.com/plugins/hello-world/front/dist/index.iife.js')
        .to_return(
          status: 200,
          body: 'console.log("hello world");',
          headers: { 'Content-Type' => 'application/javascript' }
        )

      do_request(id: '0')

      assert_status 200
      expect(response_headers['Content-Type']).to include 'application/javascript'
      expect(response_body).to eq 'console.log("hello world");'
    end

    example '[error] Returns 404 for unknown plugin index' do
      stub_request(:get, 'https://example.com/plugins/hello-world/manifest.json')
        .to_return(
          status: 200,
          body: { name: 'Hello world', front: { entry: 'front/dist/index.iife.js' } }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
      stub_request(:get, 'https://example.com/plugins/other-plugin/manifest.json')
        .to_return(status: 404)

      do_request(id: '99')

      assert_status 404
    end
  end
end
