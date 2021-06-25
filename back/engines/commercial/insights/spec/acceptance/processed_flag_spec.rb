# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Processed flag for view inputs' do
  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when normal user' do
      before { user_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  shared_examples 'not-found requests' do
    example "returns 404 if a view doesn't exist", document: false do
      do_request(view_id: "bad_uuid")
      expect(status).to eq(404)
    end

    example "returns 404 if an input doesn't exist", document: false do
      do_request(input_id: "bad_uuid")
      expect(status).to eq(404)
    end
  end

  post 'web_api/v1/insights/views/:view_id/inputs/:input_id/processed_flag' do
    context 'when admin' do
      before { admin_header_token }

      let(:input) { create(:idea, project: view.scope) }
      let(:input_id) { input.id }

      example_request 'flags the input as processed' do
        expect(status).to eq(201)

        expect(input.processed(view)).to eq(true)
      end

      example 'errors if the input was already processed' do
        create(:processed_flag, input: input, view: view)

        do_request
        expect(status).to eq(422)
      end

      include_examples 'not-found requests'
    end

    include_examples 'unauthorized requests'
  end
end
