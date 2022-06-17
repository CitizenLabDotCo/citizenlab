# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Home Page' do
  explanation 'Test for home pages.'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/home_page' do
    example_request 'retrieve the single homepage for the tenant' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end
  end
end
