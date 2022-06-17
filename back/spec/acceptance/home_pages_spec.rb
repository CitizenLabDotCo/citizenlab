# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
# require_relative './shared/publication_filtering_model'

resource 'Home Pages' do
  explanation 'Test for home pages.'

  before do
    header 'Content-Type', 'application/json'
    # @areas = create_list(:area, 5)
  end

  get 'web_api/v1/homepages' do
    # with_options scope: :page do
    #   parameter :number, 'Page number'
    #   parameter :size, 'Number of areas per page'
    # end
    example_request 'retrieve the single homepage for the tenant' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end
  end
end
