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
    with_options scope: :page, required: false do
      parameter :number, 'Page number (starts at 1)'
      parameter :size, "Number of inputs per page (max. #{Insights::InputsFinder::MAX_PER_PAGE})"
    end

    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :category, 'Filter by category'
      parameter :categories, 'Filter inputs by categories (union)'
      parameter :keywords, 'Filter by keywords (identifiers of keyword nodes)'
      parameter :processed, 'Filter by processed status'
    end

    let_it_be(:view) { create(:view, nb_data_sources: 3) }
    let_it_be(:view_id) { view.id }
    let_it_be(:ideas) { view.source_projects.map { |p| create(:idea, project: p) } }

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all inputs in the view scope' do
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to match_array(ideas.pluck(:id))
        expect(json_response[:included].pluck(:id)).to include(*ideas.pluck(:id))
      end

      example 'supports pagination', document: false do
        do_request(page: { size: 2, number: 2 })
        expect(status).to eq(200)
        expect(json_response[:data].length).to eq(1) # bc there are 3 inputs in total
      end

      example 'supports text search', document: false do
        idea = create(:idea, title_multiloc: { en: 'Love & Peace' }, project: view.source_projects.first)
        do_request(search: 'peace')
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to eq([idea.id])
      end

      example 'supports processed filter', document: false do
        create(:processed_flag, input: ideas.first, view: view)
        do_request(processed: true)
        expect(status).to eq(200)
        expect(json_response[:data].length).to eq(1)
      end

      example 'includes categories from this view only', document: false do
        categories = create_list(:category, 2, view: view)
        bad_category = create(:category)
        Insights::CategoryAssignmentsService.new.add_assignments_batch(ideas, categories.push(bad_category))

        do_request

        expect(status).to eq(200)
        expect(json_response[:data].map { |input| input[:relationships][:categories][:data].length }).to eq([2, 2, 2])
      end

      example 'supports filtering by keywords', document: false do
        localized_network = create(:insights_text_network, view: view)

        # Filtering using the first keyword
        keyword = localized_network.nodes.first.name
        keyword_id = "#{localized_network.language}/#{localized_network.network.nodes.first.id}"

        # Making sure an input containing the keyword exists
        idea = create(
          :idea,
          project: view.source_projects.first,
          body_multiloc: { en: "... #{keyword} ..." }
        )

        do_request(keywords: [keyword_id])

        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to eq([idea.id])
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/insights/views/:view_id/inputs/as_xlsx' do
    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :category, 'Filter by category'
      parameter :categories, 'Filter inputs by categories (union)'
      parameter :keywords, 'Filter by keywords (identifiers of keyword nodes)'
      parameter :processed, 'Filter by processed status'
    end

    let_it_be(:view) { create(:view, nb_data_sources: 3) }
    let_it_be(:view_id) { view.id }
    let_it_be(:ideas) { view.source_projects.map { |p| create(:idea, project: p) } }

    context 'when admin' do
      before do
        admin_header_token
        # Stub MAX_PER_PAGE to a low number to make sure it is not applied and results are not truncated.
        stub_const('Insights::InputsFinder::MAX_PER_PAGE', 1)
      end

      example_request 'contains all ideas in the scope' do
        expect(status).to eq(200)

        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        id_column = worksheet.map { |row| row.cells[0].value }
        identifiers = id_column.drop(1) # dropping the column name

        expect(identifiers).to match_array(ideas.pluck(:id))
      end

      example 'supports processed filter', document: false do
        create(:processed_flag, input: ideas.first, view: view)

        do_request(processed: true)

        expect(status).to eq(200)
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet.count).to eq(2) # header plus one idea
      end

      example 'delegates filtering to Insights::InputsFinder', document: false do
        filtering_params = { search: 'query', keywords: %w[node-1 node-2], categories: ['uuid-1'] }
        allow(Insights::InputsFinder).to receive(:new).and_call_original

        do_request(**filtering_params)

        expect(Insights::InputsFinder).to have_received(:new) do |view_, params|
          expect(view_).to eq(view)
          expect(params.to_h).to eq(filtering_params.with_indifferent_access)
        end
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

    let(:idea) { create(:idea, project: view.source_projects.first) }
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

      example 'get one input with a(n approved) category', document: false do
        category = create(:category, view: view)
        create(:category_assignment, input: idea, category: category)

        do_request

        aggregate_failures 'test response' do
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

        aggregate_failures 'test response' do
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

    include_examples 'unauthorized requests'
  end
end
