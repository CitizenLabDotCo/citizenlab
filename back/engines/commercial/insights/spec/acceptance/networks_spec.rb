# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Text networks' do
  explanation 'Text networks are graphs representing relationships between key concepts in a set of inputs.'

  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  get 'web_api/v1/insights/views/:view_id/network' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'returns the network representation of the view inputs' do
        expect(status).to eq(200)
      end
    end

    include_examples 'unauthorized requests'
  end
end
