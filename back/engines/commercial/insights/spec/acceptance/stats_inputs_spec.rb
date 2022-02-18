require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Stats - Inputs' do
  explanation 'The various stats endpoints can be used to show certain properties of inputs.'

  header 'Content-Type', 'application/json'

  let_it_be(:view) { create(:view, nb_data_sources: 3) }
  let(:view_id) { view.id }
  let(:assignment_service) { Insights::CategoryAssignmentsService.new }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  get 'web_api/v1/insights/views/:view_id/stats/inputs_count' do
    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :category, 'Filter by category'
      parameter :categories, 'Filter inputs by categories (union)'
      parameter :keywords, 'Filter by keywords (identifiers of keyword nodes)'
      parameter :processed, 'Filter by processed status'
    end

    context 'when admin' do
      before { admin_header_token }

      let_it_be(:ideas) { view.source_projects.map { |p| create(:idea, project: p) } }
      let_it_be(:other_ideas) { create_list(:idea, 2) }

      example_request 'Count all inputs' do
        expect(response_status).to eq 200
        expect(json_response_body[:count]).to eq ideas.length
      end

      example 'delegates filtering to Insights::InputsFinder', document: false do
        filtering_params = { search: 'query', keywords: %w[node-1 node-2], categories: ['uuid-1'], processed: 'true' }
        allow(Insights::InputsFinder).to receive(:new).and_call_original

        do_request(**filtering_params)

        expect(Insights::InputsFinder).to have_received(:new) do |view_, params|
          expect(view_).to eq(view)
          expect(params.to_h).to eq(filtering_params.with_indifferent_access)
        end
      end

      example 'supports processed filter', document: false do
        create(:processed_flag, input: ideas.first, view: view)

        do_request(processed: true)

        expect(status).to eq(200)
        expect(json_response_body[:count]).to eq(1)
      end
    end

    include_examples 'unauthorized requests'
  end
end
