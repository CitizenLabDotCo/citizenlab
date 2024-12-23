# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comment Reactions' do
  explanation 'Reactions are used to express agreement on content (i.e. comments).'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
    @project = create(:single_phase_ideation_project)
    @idea = create(:idea, project: @project, phases: @project.phases)
    @comment = create(:comment, post: @idea)
    @reactions = create_list(:reaction, 2, reactable: @comment)
  end

  get 'web_api/v1/comments/:comment_id/reactions' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of reactions per page'
    end

    let(:comment_id) { @comment.id }

    example_request 'List all reactions of a comment' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/reactions/:id' do
    let(:id) { @reactions.first.id }

    example_request 'Get one reaction on a comment by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @reactions.first.id
    end

    example '[error] Get one reaction on a comment by id' do
      @user = create(:user)
      header_token_for @user

      @reactions.first.reactable.idea.update!(project: create(:project_with_current_phase))
      do_request

      assert_status 401
    end
  end

  post 'web_api/v1/comments/:comment_id/reactions' do
    with_options scope: :reaction do
      parameter :user_id, 'The user id of the user owning the reaction. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Reaction)

    let(:comment_id) { @comment.id }
    let(:mode) { 'up' }

    example_request 'Create a reaction on a comment' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@comment.reload.likes_count).to eq 3
    end

    describe do
      before { @comment.update!(post: create(:idea)) }

      example 'Create a reaction on a comment of an idea', document: false do
        do_request
        assert_status 201
      end
    end
  end

  post 'web_api/v1/comments/:comment_id/reactions/up' do
    let(:comment_id) { @comment.id }

    example_request "Like a comment that doesn't have your reaction yet" do
      assert_status 201
      expect(@comment.reload.likes_count).to eq 3
      expect(@comment.reload.dislikes_count).to eq 0
    end

    example 'Like a comment that you disliked before' do
      @comment.reactions.create(user: @user, mode: 'down')
      do_request
      assert_status 201
      expect(@comment.reload.likes_count).to eq 3
      expect(@comment.reload.dislikes_count).to eq 0
    end

    example '[error] Like a comment that you liked before' do
      @comment.reactions.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_liked')
      expect(@comment.reload.likes_count).to eq 3
      expect(@comment.reload.dislikes_count).to eq 0
    end
  end

  post 'web_api/v1/comments/:comment_id/reactions/down' do
    let(:comment_id) { @comment.id }

    example '[error] Dislike a comment that you liked before' do
      @comment.reactions.create(user: @user, mode: 'up')
      do_request
      assert_status 401
      expect(@comment.reload.likes_count).to eq 3
      expect(@comment.reload.dislikes_count).to eq 0
    end

    # example_request "Dislike a comment that doesn't have your reaction yet" do
    #   assert_status 201
    #   expect(@comment.reload.likes_count).to eq 2
    #   expect(@comment.reload.dislikes_count).to eq 1
    # end

    # example "Dislike a comment that you liked before" do
    #   @comment.reactions.create(user: @user, mode: 'up')
    #   do_request
    #   assert_status 201
    #   expect(@comment.reload.likes_count).to eq 2
    #   expect(@comment.reload.dislikes_count).to eq 1
    # end

    # example "[error] Dislike a comment that you disliked before" do
    #   @comment.reactions.create(user: @user, mode: 'down')
    #   do_request
    #   assert_status 422
    #   json_response = json_parse(response_body)
    #   expect(json_response[:errors][:base][0][:error]).to eq "already_disliked"
    #   expect(@comment.reload.likes_count).to eq 2
    #   expect(@comment.reload.dislikes_count).to eq 1
    # end
  end

  delete 'web_api/v1/reactions/:id' do
    let(:reaction) { create(:reaction, user: @user, reactable: @comment) }
    let(:id) { reaction.id }

    example_request 'Delete a reaction from a comment' do
      expect(response_status).to eq 200
      expect { Reaction.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
