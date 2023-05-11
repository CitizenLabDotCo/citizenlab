# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comment Votes' do
  explanation 'Votes are used to express agreement on content (i.e. comments).'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
    @project = create(:continuous_project)
    @idea = create(:idea, project: @project)
    @comment = create(:comment, post: @idea)
    @votes = create_list(:vote, 2, votable: @comment)
  end

  get 'web_api/v1/comments/:comment_id/votes' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of votes per page'
    end

    let(:comment_id) { @comment.id }

    example_request 'List all votes of a comment' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/votes/:id' do
    let(:id) { @votes.first.id }

    example_request 'Get one vote on a comment by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @votes.first.id
    end

    example '[error] Get one vote on a comment by id' do
      @user = create(:user)
      header_token_for @user

      @votes.first.votable.idea.update!(project: create(:project_with_current_phase))
      do_request

      assert_status 401
    end
  end

  post 'web_api/v1/comments/:comment_id/votes' do
    with_options scope: :vote do
      parameter :user_id, 'The user id of the user owning the vote. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Vote)

    let(:comment_id) { @comment.id }
    let(:mode) { 'up' }

    example_request 'Create a vote on a comment' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@comment.reload.upvotes_count).to eq 3
    end

    describe do
      before { @comment.update!(post: create(:initiative)) }

      example 'Create a vote on a comment of an initiative', document: false do
        do_request
        assert_status 201
      end
    end
  end

  post 'web_api/v1/comments/:comment_id/votes/up' do
    let(:comment_id) { @comment.id }

    example_request "Upvote a comment that doesn't have your vote yet" do
      assert_status 201
      expect(@comment.reload.upvotes_count).to eq 3
      expect(@comment.reload.downvotes_count).to eq 0
    end

    example 'Upvote a comment that you downvoted before' do
      @comment.votes.create(user: @user, mode: 'down')
      do_request
      assert_status 201
      expect(@comment.reload.upvotes_count).to eq 3
      expect(@comment.reload.downvotes_count).to eq 0
    end

    example '[error] Upvote a comment that you upvoted before' do
      @comment.votes.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_upvoted')
      expect(@comment.reload.upvotes_count).to eq 3
      expect(@comment.reload.downvotes_count).to eq 0
    end
  end

  post 'web_api/v1/comments/:comment_id/votes/down' do
    let(:comment_id) { @comment.id }

    example '[error] Downvote a comment that you upvoted before' do
      @comment.votes.create(user: @user, mode: 'up')
      do_request
      assert_status 401
      expect(@comment.reload.upvotes_count).to eq 3
      expect(@comment.reload.downvotes_count).to eq 0
    end

    # example_request "Downvote a comment that doesn't have your vote yet" do
    #   assert_status 201
    #   expect(@comment.reload.upvotes_count).to eq 2
    #   expect(@comment.reload.downvotes_count).to eq 1
    # end

    # example "Downvote a comment that you upvoted before" do
    #   @comment.votes.create(user: @user, mode: 'up')
    #   do_request
    #   assert_status 201
    #   expect(@comment.reload.upvotes_count).to eq 2
    #   expect(@comment.reload.downvotes_count).to eq 1
    # end

    # example "[error] Downvote a comment that you downvoted before" do
    #   @comment.votes.create(user: @user, mode: 'down')
    #   do_request
    #   assert_status 422
    #   json_response = json_parse(response_body)
    #   expect(json_response[:errors][:base][0][:error]).to eq "already_downvoted"
    #   expect(@comment.reload.upvotes_count).to eq 2
    #   expect(@comment.reload.downvotes_count).to eq 1
    # end
  end

  delete 'web_api/v1/votes/:id' do
    let(:vote) { create(:vote, user: @user, votable: @comment) }
    let(:id) { vote.id }

    example_request 'Delete a vote from a comment' do
      expect(response_status).to eq 200
      expect { Vote.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
