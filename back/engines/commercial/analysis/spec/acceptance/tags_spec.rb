# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Tags' do
  explanation 'Analysis tags'

  before { header 'Content-Type', 'application/json' }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when resident' do
      before { resident_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  shared_examples 'unprocessable entity' do
    context 'when name is empty' do
      let(:name) { '' }

      example 'returns unprocessable-entity error', document: false do
        do_request
        assert_status 422
      end
    end
  end

  get 'web_api/v1/analyses/:analysis_id/tags' do
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }
    let!(:tags) { create_list(:tag, 3, analysis: analysis) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all tags of an analysis' do
        assert_status 200
        expect(json_response_body[:data].pluck(:id)).to match_array(tags.pluck(:id))
      end

      example 'returns 404 if the analysis does not exist', document: false do
        do_request(analysis_id: 'bad-uuid')
        assert_status 404
      end
    end

    include_examples 'unauthorized requests'
  end

  post 'web_api/v1/analyses/:analysis_id/tags' do
    route_description <<~DESC
      Allows to create a new tag. 
    DESC

    with_options scope: :tag do
      parameter :name, 'The name of the tag.', required: true
    end

    ValidationErrorHelper.new.error_fields(self, Analysis::Tag)

    let(:name) { 'tag-name' }
    let(:analysis) { create(:analysis) }
    let(:analysis_id) { analysis.id }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        {
          data: {
            id: kind_of(String),
            type: 'tag',
            attributes: { name: name, tag_type: 'custom', created_at: kind_of(String), updated_at: kind_of(String) },
            relationships: { analysis: { data: { id: analysis_id, type: 'analysis' } } }
          }
        }
      end

      example_request 'creates a new tag' do
        expect(status).to eq(201)
        expect(json_response_body).to match(expected_response)
      end

      include_examples 'unprocessable entity'
    end

    include_examples 'unauthorized requests'
  end

  patch 'web_api/v1/analyses/:analysis_id/tags/:id' do
    with_options scope: :tag do
      parameter :name, 'The name of the tag.', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Insights::Category)

    let(:tag) { create(:tag) }
    let(:analysis_id) { tag.analysis_id }
    let(:id) { tag.id }

    let(:previous_name) { tag.name }
    let(:name) { 'Da tag!' }

    context 'when admin' do
      before { admin_header_token }

      let(:expected_response) do
        {
          data: {
            id: anything,
            type: 'tag',
            attributes: { name: name, tag_type: 'custom', created_at: anything, updated_at: anything },
            relationships: {
              analysis: { data: { id: analysis_id, type: 'analysis' } }
            }
          }
        }
      end

      example_request 'updates a tag' do
        expect(name).not_to eq(previous_name) # making sure we didn't reuse the same name by mistake
        assert_status 200
        expect(json_response_body).to match(expected_response)
      end

      include_examples 'unprocessable entity'
    end

    include_examples 'unauthorized requests'
  end

  delete 'web_api/v1/analyses/:analysis_id/tags/:id' do
    let(:tag) { create(:tag) }
    let(:analysis_id) { tag.analysis_id }
    let(:id) { tag.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'deletes a tag' do
        assert_status 200
        expect { tag.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    include_examples 'unauthorized requests'
  end
end
