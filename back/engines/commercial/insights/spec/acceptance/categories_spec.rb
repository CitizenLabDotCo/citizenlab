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
    with_options scope: :category do
      parameter :name, 'The name of the category.', required: true
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

      example 'sets all input as unprocessed', document: false do
        do_request
        expect(status).to eq(200)
        expect(view.scope.ideas.map { |idea| idea.processed(view) }.uniq).to be_empty
      end

      example 'returns 404 if the view does not exist', document: false do
        do_request(view_id: 'bad-uuid')
        expect(status).to eq(404)
      end
    end

    include_examples 'unauthorized requests'
  end
end
