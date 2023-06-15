# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Votes' do
  explanation 'All votes created in the platform'

  include_context 'common_auth'

  let_it_be(:idea_votes) do
    create_list(:vote2, 3, :for_idea, created_at: '2020-01-01', updated_at: '2021-01-01')
  end

  let_it_be(:initiative_votes) do
    create_list(:vote2, 2, :for_initiative, created_at: '2020-01-02', updated_at: '2021-01-02')
  end

  let_it_be(:comment_votes) do
    idea_comment = create(:comment)
    initiative_comment = create(:comment, :on_initiative)

    [
      create(
        :vote2, votable: initiative_comment,
        created_at: '2020-01-03', updated_at: '2021-01-03'
      ),
      create(
        :vote2, votable: idea_comment,
        created_at: '2020-01-03', updated_at: '2021-01-03'
      )
    ]
  end

  get '/api/v2/votes' do
    route_summary 'List all votes'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the votes in the platform. You can filter the 
      votes in different ways. For example, you can filter by "votable type" (the type
      of resource that was voted on), by user identifier, or by date range.
    DESC

    include_context 'common_list_params'

    parameter(
      :votable_type, <<~DESC.squish,
        List only the votes that were cast on a specific type of resource. 'initiative'
        corresponds to proposals on the platform. 'idea-comment' and 'initiative-comment'
        filter votes on comments on ideas and comments on proposals, respectively.
      DESC
      required: false,
      in: 'query',
      type: 'string',
      enum: PublicApi::V2::VotesController::VOTABLE_TYPES
    )

    parameter(:user_id, <<~DESC.squish, required: false, in: 'query', type: 'string')
      List only the votes that were cast by a specific user.
    DESC

    example_request 'List all votes' do
      assert_status 200
      expect(json_response_body[:votes].size).to eq(Vote.count)
      expect(json_response_body[:meta]).to eq(current_page: 1, total_pages: 1)
    end

    context 'when the page size is smaller than the total number of votes' do
      let(:page_size) { 2 }

      example_request 'Lists only the first votes' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(page_size)

        total_pages = (Vote.count.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq(
          current_page: 1,
          total_pages: total_pages
        )
      end
    end

    context 'when votable_type value is invalid' do
      let(:votable_type) { 'invalid-type' }

      example_request 'Returns a bad request error' do
        assert_status 400

        expect(json_response_body).to match(
          type: kind_of(String),
          title: 'Invalid value for an enum parameter',
          status: 400,
          detail: "The value '#{votable_type}' is not allowed for the parameter 'votable_type'. Accepted values are: idea, initiative, comment, idea-comment, initiative-comment.",
          parameter_name: 'votable_type',
          parameter_value: votable_type,
          allowed_values: PublicApi::V2::VotesController::VOTABLE_TYPES
        )
      end
    end

    context "when votable_type value is 'initiative'" do
      let(:votable_type) { 'initiative' }

      example_request 'Lists only the votes for initiatives' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(2)
      end
    end

    context "when votable_type value is 'comment'" do
      let(:votable_type) { 'comment' }

      example_request 'Lists only the votes for comments' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(comment_votes.size)
      end
    end

    context "when votable_type value is 'idea-comment'" do
      let(:votable_type) { 'idea-comment' }

      example_request 'Lists only the votes for comments on ideas' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(1)
      end
    end

    context "when votable_type value is 'initiative-comment'" do
      let(:votable_type) { 'initiative-comment' }

      example_request 'Lists only the votes for comments on initiatives' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(1)
      end
    end

    context 'when filtering by user_id' do
      let!(:user) { create(:user) }
      let!(:user_votes) { create_list(:vote2, 2, user: user) }

      let(:user_id) { user.id }

      example_request 'Lists only the votes cast by the specified user' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(user_votes.size)
      end
    end

    context 'when filtering by created_at' do
      let(:created_at) { '2020-01-01,2020-01-02' }

      example_request 'Lists only the votes created between the specified dates' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(5)
      end
    end

    context 'when filtering by updated_at' do
      let(:updated_at) { '2021-01-02,2021-01-02' }

      example_request 'Lists only the votes updated between the specified dates' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq(2)
      end
    end
  end
end
