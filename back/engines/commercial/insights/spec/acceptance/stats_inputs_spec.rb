require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Stats - Inputs" do
  explanation "The various stats endpoints can be used to show certain properties of inputs."

  before { header 'Content-Type', 'application/json' }

  let(:view) { create(:view) }
  let(:view_id) { view.id }

  let(:json_response) { json_parse(response_body) }
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

  get "web_api/v1/insights/views/:view_id/stats/inputs_count" do
    parameter :category, 'Filter by category', required: false
    parameter :processed, 'Filter by category', required: false
    parameter :search, 'Filter by search', required: false

    context 'when admin' do
      before { admin_header_token }
      let!(:ideas) { create_list(:idea, 3, project: view.scope) }
      let!(:other_ideas) { create_list(:idea, 2) }

      example_request "Count all inputs" do
        expect(response_status).to eq 200
        expect(json_response[:count]).to eq ideas.length
      end

      example 'supports processed filter', document: false do
        create(:processed_flag, input: ideas.first, view: view)
        do_request(processed: true)
        expect(status).to eq(200)
        expect(json_response[:count]).to eq(1) # bc there are 3 inputs in total
      end

      context 'with categories filter' do
        let(:category) { create(:category, view: view) }
        before { assignment_service.add_assignments_batch(ideas.take(2), [category]) }

        example 'Count for one category', document: false do
          do_request(category: category.id)

          expect(response_status).to eq 200
          expect(json_response[:count]).to eq 2
        end

        example 'Count uncategorized', document: false do
          do_request(category: '')

          expect(response_status).to eq 200
          expect(json_response[:count]).to eq 1
        end
      end

    end
    include_examples 'unauthorized requests'
  end
end
