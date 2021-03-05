# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# rubocop:disable Metrics/BlockLength
resource 'IdeaStatuses' do
  explanation 'Idea statuses reflect the cities attitude towards an idea. Each tenant has its own custom set of idea statuses.'

  before do
    header 'Content-Type', 'application/json'
    @statuses = create_list(:idea_status, 3)
  end

  context 'when not logged in' do
    get 'web_api/v1/idea_statuses' do
      example_request 'List all idea statuses' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end

    get 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      example_request 'Get one idea status by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @statuses.first.id
      end
    end
  end

  context 'when signed in as a non-admin user' do
    before do
      user_header_token
    end

    get 'web_api/v1/idea_statuses' do
      example_request 'List all idea statuses', document: false do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end

    get 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      example_request 'Get one idea status by id', document: false do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @statuses.first.id
      end
    end
  end

  context 'when signed in as an admin' do
    before do
      admin_header_token
    end

    get 'web_api/v1/idea_statuses' do
      example_request 'List all idea statuses', document: false do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    end

    get 'web_api/v1/idea_statuses/:id' do
      let(:id) { @statuses.first.id }

      example_request 'Get one idea status by id', document: false do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @statuses.first.id
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength
