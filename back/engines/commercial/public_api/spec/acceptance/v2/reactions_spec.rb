# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Reactions' do
  explanation 'All reactions (likes/dislikes) created in the platform'

  include_context 'common_auth'

  let_it_be(:idea_reactions) do
    create_list(:reaction2, 3, :for_idea, created_at: '2020-01-01', updated_at: '2021-01-01')
  end

  let_it_be(:initiative_reactions) do
    create_list(:reaction2, 2, :for_initiative, created_at: '2020-01-02', updated_at: '2021-01-02')
  end

  let_it_be(:comment_reactions) do
    idea_comment = create(:comment)
    initiative_comment = create(:comment, :on_initiative)

    [
      create(
        :reaction2, reactable: initiative_comment,
        created_at: '2020-01-03', updated_at: '2021-01-03'
      ),
      create(
        :reaction2, reactable: idea_comment,
        created_at: '2020-01-03', updated_at: '2021-01-03'
      )
    ]
  end

  get '/api/v2/reactions' do
    route_summary 'List all reactions'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the reactions in the platform. You can filter the 
      reactions in different ways. For example, you can filter by "reactable type" (the type
      of resource that was reacted to), by user identifier, or by date range.
    DESC

    include_context 'common_list_params'

    parameter(
      :reactable_type, <<~DESC.squish,
        List only the reactions that were cast on a specific type of resource. 'initiative'
        corresponds to proposals on the platform. 'idea-comment' and 'initiative-comment'
        filter reactions on comments on ideas and comments on proposals, respectively.
      DESC
      required: false,
      in: 'query',
      type: 'string',
      enum: PublicApi::V2::ReactionsController::REACTABLE_TYPES
    )

    parameter(:user_id, <<~DESC.squish, required: false, in: 'query', type: 'string')
      List only the reactions that were cast by a specific user.
    DESC

    example_request 'List all reactions' do
      assert_status 200
      expect(json_response_body[:reactions].size).to eq(Reaction.count)
      expect(json_response_body[:meta]).to eq(current_page: 1, total_pages: 1)
      expect(json_response_body[:reactions].first.keys).to match_array(
        %i[
          id mode reactable_id reactable_type created_at updated_at
          user_id idea_id project_id initiative_id
        ]
      )
    end

    context 'when the page size is smaller than the total number of reactions' do
      let(:page_size) { 2 }

      example_request 'Lists only the first reactions' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(page_size)

        total_pages = (Reaction.count.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq(
          current_page: 1,
          total_pages: total_pages
        )
      end
    end

    context 'when reactable_type value is invalid' do
      let(:reactable_type) { 'invalid-type' }

      example_request 'Returns a bad request error' do
        assert_status 400

        expect(json_response_body).to match(
          type: kind_of(String),
          title: 'Invalid value for an enum parameter',
          status: 400,
          detail: "The value '#{reactable_type}' is not allowed for the parameter 'reactable_type'. Accepted values are: idea, initiative, comment, idea-comment, initiative-comment.",
          parameter_name: 'reactable_type',
          parameter_value: reactable_type,
          allowed_values: PublicApi::V2::ReactionsController::REACTABLE_TYPES
        )
      end
    end

    context "when reactable_type value is 'initiative'" do
      let(:reactable_type) { 'initiative' }

      example_request 'Lists only the reactions for initiatives' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(2)
      end
    end

    context "when reactable_type value is 'comment'" do
      let(:reactable_type) { 'comment' }

      example_request 'Lists only the reactions for comments' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(comment_reactions.size)
      end
    end

    context "when reactable_type value is 'idea-comment'" do
      let(:reactable_type) { 'idea-comment' }

      example_request 'Lists only the reactions for comments on ideas' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(1)
      end
    end

    context "when reactable_type value is 'initiative-comment'" do
      let(:reactable_type) { 'initiative-comment' }

      example_request 'Lists only the reactions for comments on initiatives' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(1)
      end
    end

    context 'when filtering by user_id' do
      let!(:user) { create(:user) }
      let!(:user_reactions) { create_list(:reaction2, 2, user: user) }

      let(:user_id) { user.id }

      example_request 'Lists only the reactions cast by the specified user' do
        assert_status 200
        expect(json_response_body[:reactions].size).to eq(user_reactions.size)
      end
    end

    include_examples 'filtering_by_date', :reaction2, :created_at, :reaction
    include_examples 'filtering_by_date', :reaction2, :updated_at, :reaction
  end
end
