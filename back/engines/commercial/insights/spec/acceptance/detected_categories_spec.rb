# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Detected categories' do
  explanation 'Proposed categories that are detected by the NLP service'

  before { header 'Content-Type', 'application/json' }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  get 'web_api/v1/insights/views/:view_id/detected_categories' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let(:detected_categories) { create_list(:detected_category, 5, view: view) }
    before { detected_categories }

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all detected categories of a view' do
        expect(status).to eq(200)
        expect(json_response_body.dig(:data).length).to eq(detected_categories.length)
      end

      example 'does not repeat existing categories', document: false do
        create(:detected_category, view: view, name: 'housing')
        create(:category, view: view, name: 'housing')
        do_request
        expect(status).to eq(200)
        expect(json_response_body.dig(:data).map { |detected_category| detected_category[:attributes][:name] }).not_to include('housing')
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end
end
