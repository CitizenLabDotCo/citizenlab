# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Comments' do
  explanation 'All comments created on the platform'

  include_context 'common_auth'

  let_it_be(:comments) { create_list(:comment, 3, created_at: '2020-01-01') }

  get '/api/v2/comments/' do
    route_summary 'List all comments'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the comments in the platform. You can filter the 
      comments in different ways. For example, you can filter by "post type", or by date
      range.
    DESC

    include_context 'common_list_params'

    example_request 'List all comments' do
      assert_status 200
      expect(json_response_body[:comments].size).to eq 3
      expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      expect(json_response_body[:comments].first.keys).to match_array(
        %i[
          id body idea_id project_id parent_id author_id created_at updated_at
          body_updated_at children_count dislikes_count likes_count publication_status
        ]
      )
    end

    context 'when the page size is smaller than the total number of comments' do
      let(:page_size) { 2 }

      example_request 'List only the first comments' do
        assert_status 200
        expect(json_response_body[:comments].size).to eq(page_size)

        total_pages = (comments.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end
  end

  get '/api/v2/comments/:id' do
    route_summary 'Get comment'
    route_description 'Retrieve a single comment by its ID.'

    include_context 'common_item_params'

    let(:comment) { comments[0] }
    let(:id) { comment.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the comment.
      body = comment[:body_multiloc]
      body['nl-NL'] = body.delete('nl-BE')
      comment.update(body_multiloc: body)
    end

    example_request 'Returns the comment in the default locale' do
      assert_status 200
      expect(json_response_body[:comment]).to include({ id: id })
    end

    context 'when requesting the comment in a specific locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the comment in the requested locale' do
        assert_status 200
        expect(json_response_body.dig(:comment, :body))
          .to eq comment.body_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :comments
end
