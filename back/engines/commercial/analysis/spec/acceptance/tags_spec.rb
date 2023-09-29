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
    with_options required: false do
      parameter :search, 'Filter by searching in title and body'
      parameter :'author_custom_<uuid>_from', 'Filter by custom field value of the author for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>_to', 'Filter by custom field value of the author for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'author_custom_<uuid>', 'Filter by custom field value of the author, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :'input_custom_<uuid>_from', 'Filter by custom field value of the input for numerical fields, larger than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>_to', 'Filter by custom field value of the input for numerical fields, smaller than or equal to. Replace <uuid> with the custom_field id'
      parameter :'input_custom_<uuid>', 'Filter by custom field value of the input, for select, multiselect, date and number fields (union). Replace <uuid> with the custom_field id', type: :array
      parameter :published_at_from, 'Filter by input publication date, after or equal to', type: :date
      parameter :published_at_to, 'Filter by input publication date, before or equal to', type: :date
      parameter :reactions_from, 'Filter by number of reactions on the input, larger than or equal to', type: :integer
      parameter :reactions_to, 'Filter by number of reactions on the input, smaller than or equal to', type: :integer
      parameter :votes_from, 'Filter by number of votes on the input, larger than or equal to', type: :integer
      parameter :votes_to, 'Filter by number of votes on the input, smaller than or equal to', type: :integer
      parameter :comments_from, 'Filter by number of comments on the input, larger than or equal to', type: :integer
      parameter :comments_to, 'Filter by number of comments on the input, smaller than or equal to', type: :integer
    end

    let_it_be(:analysis) { create(:analysis) }
    let_it_be(:analysis_id) { analysis.id }
    let_it_be(:tags) { create_list(:tag, 3, analysis: analysis) }
    let_it_be(:input1) { create(:idea, project: analysis.project, comments_count: 2) }
    let_it_be(:input2) { create(:idea, project: analysis.project, comments_count: 5) }
    let_it_be(:input3) { create(:idea, project: analysis.project, comments_count: 5) }
    let_it_be(:taggings) do
      create(:tagging, input: input1, tag: tags[0])
      create(:tagging, input: input1, tag: tags[1])
      create(:tagging, input: input2, tag: tags[1])
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'lists all tags of an analysis' do
        assert_status 200
        # tags sorted by descending tag count, then by ascending creation time if equal
        expect(response_data.pluck(:id)).to eq([tags[1].id, tags[0].id, tags[2].id])
        expect(json_response_body[:meta]).to eq({
          inputs_total: 3,
          filtered_inputs_total: 3,
          inputs_without_tags: 1,
          filtered_inputs_without_tags: 1
        })
      end

      example 'lists filtered tags of analysis (comments > 5), with correct counts', document: false do
        do_request(comments_from: 5)
        assert_status 200

        expect(response_data.find { |d| d[:id] == tags[0].id }[:attributes][:total_input_count]).to eq 1
        expect(response_data.find { |d| d[:id] == tags[1].id }[:attributes][:total_input_count]).to eq 2
        expect(response_data.find { |d| d[:id] == tags[2].id }[:attributes][:total_input_count]).to eq 0

        expect(response_data.find { |d| d[:id] == tags[0].id }[:attributes][:filtered_input_count]).to eq 0
        expect(response_data.find { |d| d[:id] == tags[1].id }[:attributes][:filtered_input_count]).to eq 1
        expect(response_data.find { |d| d[:id] == tags[2].id }[:attributes][:filtered_input_count]).to eq 0

        expect(json_response_body[:meta]).to eq({
          inputs_total: 3,
          filtered_inputs_total: 2,
          inputs_without_tags: 1,
          filtered_inputs_without_tags: 1
        })
      end

      example 'properly interprets array filter params that filter for absent values', document: false do
        custom_field = create(:custom_field_select, :with_options)
        input4 = create(:idea, project: analysis.source_project,
          author: create(:user, custom_field_values: { custom_field.key => custom_field.options.first.key }))
        create(:tagging, input: input4, tag: tags[0])

        # What the front-end passes to its request framework
        #  -> `author_custom_uuid: [null]`
        # How it gets encoded in url parameters
        #  -> `?author_custom_uuid[]=`
        # How rails interprets this and passed it in the params object
        #  -> `author_custom_uuid: [""]`

        # do_request bypasses first 2 layers, so we feed it the rails
        # interpretations immediately
        do_request({ "author_custom_#{custom_field.id}" => [''] })
        expect(status).to eq 200

        expect(response_data.find { |d| d[:id] == tags[0].id }[:attributes][:total_input_count]).to eq 2
        expect(response_data.find { |d| d[:id] == tags[1].id }[:attributes][:total_input_count]).to eq 2
        expect(response_data.find { |d| d[:id] == tags[2].id }[:attributes][:total_input_count]).to eq 0

        expect(response_data.find { |d| d[:id] == tags[0].id }[:attributes][:filtered_input_count]).to eq 1
        expect(response_data.find { |d| d[:id] == tags[1].id }[:attributes][:filtered_input_count]).to eq 2
        expect(response_data.find { |d| d[:id] == tags[2].id }[:attributes][:filtered_input_count]).to eq 0
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
            attributes: { name: name, tag_type: 'custom', total_input_count: 0, filtered_input_count: 0, created_at: kind_of(String), updated_at: kind_of(String) },
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
            attributes: { name: name, tag_type: 'custom', created_at: anything, total_input_count: 0, filtered_input_count: 0, updated_at: anything },
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
