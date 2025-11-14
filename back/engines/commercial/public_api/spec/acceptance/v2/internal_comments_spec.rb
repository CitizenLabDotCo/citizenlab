# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Internal Comments' do
  explanation 'All internal comments created on the platform'

  include_context 'common_auth'

  let_it_be(:internal_comments) { create_list(:internal_comment, 3, created_at: '2020-01-01') }

  get '/api/v2/internal_comments/' do
    route_summary 'List all internal comments'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the internal comments in the platform. You can filter the
      internal comments by the idea they belong to.
    DESC

    include_context 'common_list_params'
    parameter :idea_id, 'Filter internal comments by idea ID', required: false, type: :string

    example_request 'List all internal comments' do
      assert_status 200
      expect(json_response_body[:internal_comments].size).to eq 3
      expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      expect(json_response_body[:internal_comments].first.keys).to match_array(
        %i[
          id body idea_id project_id parent_id author_id created_at updated_at
          body_updated_at children_count publication_status
        ]
      )
    end

    context 'when the page size is smaller than the total number of internal comments' do
      let(:page_size) { 2 }

      example_request 'List only the first internal comments' do
        assert_status 200
        expect(json_response_body[:internal_comments].size).to eq(page_size)

        total_pages = (internal_comments.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context 'when filtering by idea_id' do
      let!(:idea) { create(:idea) }
      let!(:internal_comment) { create(:internal_comment, idea: idea) }
      let(:idea_id) { idea.id }

      example_request 'List internal comments filtered by idea_id' do
        assert_status 200
        expect(json_response_body[:internal_comments].size).to eq 1
        expect(json_response_body[:internal_comments].first).to include({
          id: internal_comment.id,
          idea_id: idea.id
        })
      end
    end
  end

  get '/api/v2/internal_comments/:id' do
    route_summary 'Get internal comment'
    route_description 'Retrieve a single internal comment by its ID.'

    include_context 'common_item_params'

    let(:internal_comment) { internal_comments[0] }
    let(:id) { internal_comment.id }

    example_request 'Returns the internal comment' do
      assert_status 200
      expect(json_response_body[:internal_comment]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :internal_comments

  post '/api/v2/internal_comments' do
    route_summary 'Create an internal comment'
    route_description 'Create a new internal comment on an idea.'
    include_context 'common_auth'
    header 'Content-Type', 'application/json'

    with_options scope: :internal_comment do
      parameter :body, 'Body of the internal comment', required: true, type: :string
      parameter :idea_id, 'ID of the idea to comment on', required: true, type: :string
      parameter :parent_id, 'ID of the parent internal comment (for nested comments)', required: false, type: :string
    end

    let!(:idea) { create(:idea) }
    let(:body) { '<p>This is an internal comment</p>' }
    let(:idea_id) { idea.id }
    let(:parent_id) { nil }

    example_request 'Creates an internal comment' do
      assert_status 201
      expect(json_response_body[:internal_comment]).to include({
        body: '<p>This is an internal comment</p>',
        idea_id: idea.id,
        parent_id: nil,
        publication_status: 'published',
        children_count: 0,
        created_at: kind_of(String),
        updated_at: kind_of(String)
      })
      expect(json_response_body[:internal_comment][:id]).to be_present
    end

    context 'with a parent comment' do
      let!(:parent_comment) { create(:internal_comment, idea: idea) }
      let(:parent_id) { parent_comment.id }

      example_request 'Creates a nested internal comment' do
        assert_status 201
        expect(json_response_body[:internal_comment]).to include({
          body: '<p>This is an internal comment</p>',
          idea_id: idea.id,
          parent_id: parent_comment.id,
          publication_status: 'published'
        })
      end
    end

    context 'without body' do
      let(:body) { nil }

      example_request '[Error] Creates an internal comment without body' do
        assert_status 422
        expect(json_response_body).to include({
          errors: include({
            body: [{ error: 'blank' }]
          })
        })
      end
    end

    context 'without idea_id' do
      let(:idea_id) { nil }

      example_request '[Error] Creates an internal comment without idea_id' do
        assert_status 422
        expect(json_response_body[:errors]).to have_key(:idea)
        expect(json_response_body[:errors][:idea]).to include({ error: 'blank' })
      end
    end
  end
end
