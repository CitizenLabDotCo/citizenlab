# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Comments' do
  explanation 'All comments created on the platform'

  include_context 'common_auth'

  let_it_be(:idea_comments) do
    create_list(:comment, 3, created_at: '2020-01-01')
  end

  let_it_be(:initiative_comments) do
    create_list(:comment, 2, :on_initiative, created_at: '2020-01-01')
  end

  let_it_be(:comments) { idea_comments + initiative_comments }

  get '/api/v2/comments/' do
    route_summary 'List all comments'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the comments in the platform. You can filter the 
      comments in different ways. For example, you can filter by "post type", or by date
      range.
    DESC

    include_context 'common_list_params'

    parameter(
      :post_type, <<~DESC.squish,
        List only the comments that were posted on a specific type of resource.
      DESC
      required: false,
      in: 'query',
      type: 'string',
      enum: PublicApi::V2::CommentsController::POST_TYPES
    )

    example_request 'List all comments' do
      assert_status 200
      expect(json_response_body[:comments].size).to eq 5
      expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
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

    context "when the value of the 'post_type' parameter is invalid" do
      let(:post_type) { 'invalid-post-type' }

      example_request 'Returns a bad request error' do
        assert_status 400

        expect(json_response_body).to match(
          type: kind_of(String),
          title: 'Invalid value for an enum parameter',
          status: 400,
          detail: "The value '#{post_type}' is not allowed for the parameter 'post_type'. Accepted values are: idea, initiative.",
          parameter_name: 'post_type',
          parameter_value: post_type,
          allowed_values: PublicApi::V2::CommentsController::POST_TYPES
        )
      end
    end

    context "when the value of 'post_type' is 'idea'" do
      let(:post_type) { 'idea' }

      example_request 'List only the comments posted on ideas' do
        assert_status 200

        comment_ids = json_response_body[:comments].pluck(:id)
        expect(comment_ids).to match_array(idea_comments.pluck(:id))
      end
    end

    context "when the value of 'post_type' is 'initiative'" do
      let(:post_type) { 'initiative' }

      example_request 'List only the comments posted on initiatives' do
        assert_status 200

        comment_ids = json_response_body[:comments].pluck(:id)
        expect(comment_ids).to match_array(initiative_comments.pluck(:id))
      end
    end

    include_examples 'filtering_by_date', :comment, :created_at
    include_examples 'filtering_by_date', :comment, :updated_at
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
