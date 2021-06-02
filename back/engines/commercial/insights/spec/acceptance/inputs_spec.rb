# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Inputs' do
  explanation 'Citizen inputs (only ideas for now) in the context of an Insights view.'

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

  get 'web_api/v1/insights/views/:view_id/inputs' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let!(:ideas) { create_list(:idea, 2, project: view.scope) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all inputs in the view scope' do
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to match_array(ideas.pluck(:id))
        expect(json_response[:included].pluck(:id)).to include(*ideas.pluck(:id))
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/insights/views/:view_id/inputs/:id' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }

    let(:idea) { create(:idea, project: view.scope) }
    let(:id) { idea.id }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response_backbone) do
        {
          data: {
            id: idea.id,
            type: 'input',
            relationships: {
              source: { data: { type: 'idea', id: idea.id } },
              categories: anything,
              suggested_categories: anything
            }
          },
          included: array_including(
            hash_including(type: 'idea', id: idea.id, attributes: anything)
          )
        }
      end

      example_request 'gets one input by id' do
        expect(status).to eq(200)
        expect(json_response).to match(expected_response_backbone)
      end

      # rubocop:disable RSpec/ExampleLength
      example 'get one input with a(n approved) category', document: false do
        category = create(:category, view: view)
        create(:category_assignment, input: idea, category: category)

        do_request

        aggregate_failures "test response" do
          expect(json_response.dig(:data, :relationships, :suggested_categories, :data)).to eq([])
          expect(json_response.dig(:data, :relationships, :categories, :data))
            .to match([{ type: 'category', id: category.id }])
          expect(json_response[:included]).to include(hash_including(type: 'category', id: category.id))
        end
      end

      example 'get one input with a category suggestion', document: false do
        category = create(:category, view: view)
        create(:category_assignment, input: idea, category: category, approved: false)

        do_request

        aggregate_failures "test response" do
          expect(json_response.dig(:data, :relationships, :categories, :data)).to eq([])
          expect(json_response.dig(:data, :relationships, :suggested_categories, :data))
            .to match([{ type: 'category', id: category.id }])
          expect(json_response[:included]).to include(hash_including(type: 'category', id: category.id))
        end
      end

      example 'returns 404 if the input does not exist', document: false do
        do_request(id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end
    # rubocop:enable RSpec/ExampleLength

    include_examples 'unauthorized requests'
  end
end
