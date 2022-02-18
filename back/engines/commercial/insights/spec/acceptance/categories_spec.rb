# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Categories' do
  explanation 'Insights categories'

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

  shared_examples 'unprocessable entity' do
    context 'when name is empty' do
      let(:name) { '' }

      example_request 'returns unprocessable-entity error', document: false do
        expect(status).to eq(422)
      end
    end
  end

  get 'web_api/v1/insights/views/:view_id/categories' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let!(:categories) { create_list(:category, 3, view: view) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all categories of a view' do
        expect(status).to eq(200)
        expect(json_response[:data].pluck(:id)).to match_array(categories.pluck(:id))
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end

  get 'web_api/v1/insights/views/:view_id/categories/:id' do
    let(:category) { create(:category) }
    let(:view_id) { category.view_id }
    let(:id) { category.id }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        {
          data: {
            id: category.id,
            type: 'category',
            attributes: { name: category.name, inputs_count: 0 },
            relationships: {
              view: { data: { id: view_id, type: 'view' } }
            }
          }
        }
      end

      example_request 'gets one category by id' do
        expect(status).to eq(200)
        expect(json_response).to match(expected_response)
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/insights/views/:view_id/categories' do
    route_description <<~DESC
      Allows to create a new category. The newly created category can be
      (optionally) pre-populated with a set of inputs identified by filtering
      parameters.
    DESC

    with_options scope: :category do
      parameter :name, 'The name of the category.', required: true
    end

    with_options scope: %w[category inputs], required: false do
      parameter :search, 'Filter inputs by searching in title and body'
      parameter :categories, 'Filter inputs by category (identifiers of categories)'
      parameter :keywords, 'Filter inputs by keywords (identifiers of keyword nodes)'
    end

    ValidationErrorHelper.new.error_fields(self, Insights::Category)

    let(:name) { 'category-name' }
    let(:view) { create(:view) }
    let(:view_id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        {
          data: {
            id: anything,
            type: 'category',
            attributes: { name: name, inputs_count: 0 },
            relationships: {
              view: { data: { id: view_id, type: 'view' } }
            }
          }
        }
      end

      example_request 'creates a new category' do
        expect(status).to eq(201)
        expect(json_response).to match(expected_response)
      end

      context 'with inputs-filtering parameters' do
        example 'pre-populates the new category', document: false do
          project = view.source_projects.first
          input = create(:idea, project: project, title_multiloc: { en: 'the sound of silence' })
          create(:idea, project: project, title_multiloc: { en: 'skies went dark' })

          do_request(category: { name: name, inputs: { search: 'silence' } })

          expect(status).to eq(201)
          assignments = Insights::Category.find(response_data[:id]).assignments
          expect(assignments.count).to eq(1)
          expect(assignments.map(&:input_id)).to eq [input.id]
        end

        example 'delegates filtering to Insights::InputsFinder', document: false do
          filtering_params = { search: 'query', keywords: %w[node-1 node-2], categories: ['uuid-1'] }
          allow(Insights::InputsFinder).to receive(:new).and_call_original

          do_request(category: { name: name, inputs: filtering_params })

          expect(Insights::InputsFinder).to have_received(:new) do |view_, params|
            expect(view_).to eq(view)
            expect(params.to_h).to eq(filtering_params.with_indifferent_access)
          end
        end

        example 'does not pre-populate the new category if there are no inputs parameters' do
          expect(Insights::InputsFinder).not_to receive(:new)
          do_request
        end
      end

      include_examples 'unprocessable entity'
    end

    include_examples 'unauthorized requests'
  end

  patch 'web_api/v1/insights/views/:view_id/categories/:id' do
    with_options scope: :category do
      parameter :name, 'The name of the category.', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Insights::Category)

    let(:category) { create(:category) }
    let(:view_id) { category.view_id }
    let(:id) { category.id }

    let(:previous_name) { category.name }
    let(:name) { 'Da category!' }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        {
          data: {
            id: anything,
            type: 'category',
            attributes: { name: name, inputs_count: 0 },
            relationships: {
              view: { data: { id: view_id, type: 'view' } }
            }
          }
        }
      end

      example_request 'updates a category' do
        expect(name).not_to eq(previous_name) # making sure we didn't reuse the same name by mistake
        expect(status).to eq(200)
        expect(json_response).to match(expected_response)
      end

      include_examples 'unprocessable entity'
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/categories/:id' do
    let(:category) { create(:category) }
    let(:view_id) { category.view_id }
    let(:id) { category.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'deletes a category' do
        expect(status).to eq(200)
        expect { category.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/insights/views/:view_id/categories' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let!(:categories) { create_list(:category, 3, view: view) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'deletes all categories of a view' do
        expect(status).to eq(200)
        expect(view.categories).to be_empty
      end

      example 'sets all inputs as unprocessed', document: false do
        do_request
        expect(status).to eq(200)
        expect(Insights::ProcessedFlag.where(view: view)).to be_empty
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end
end
