# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Votes' do
  explanation 'Votes are used to express agreement on content (i.e. ideas). Ideally, the city would accept the most voted ideas.'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
    @project = create(:continuous_project)
    @idea = create(:idea, project: @project)
    @votes = create_list(:vote, 2, votable: @idea)
  end

  get 'web_api/v1/ideas/:idea_id/votes' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of votes per page'
    end

    let(:idea_id) { @idea.id }

    example_request 'List all votes of an idea' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/votes/:id' do
    let(:id) { @votes.first.id }

    example_request 'Get one vote on an idea by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @votes.first.id
    end
  end

  post 'web_api/v1/ideas/:idea_id/votes' do
    with_options scope: :vote do
      parameter :user_id, 'The user id of the user owning the vote. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }
    let(:mode) { 'up' }

    example_request 'Create a vote to an idea' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@idea.reload.upvotes_count).to eq 3
    end

    describe 'When the user already voted' do
      before do
        @vote = create(:vote, votable: @idea, user: @user, mode: 'up')
      end

      example '[error] Upvote the same idea', document: false do
        do_request mode: 'up'
        assert_status 422
      end

      example '[error] Downvote the same idea', document: false do
        do_request mode: 'down'
        assert_status 422
      end
    end
  end

  post 'web_api/v1/ideas/:idea_id/votes/up' do
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "Upvote an idea that doesn't have your vote yet" do
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    example 'Upvote an idea that you downvoted before' do
      @idea.votes.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    example '[error] Upvote an idea that you upvoted before' do
      @idea.votes.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_upvoted')
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    describe do
      before do
        project = @idea.project
        project.update(voting_enabled: false)
      end

      example_request '[error] Upvote an idea in a project where voting is disabled' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq ParticipationContextService::VOTING_DISABLED_REASONS[:voting_disabled]
        expect(@idea.reload.upvotes_count).to eq 2
        expect(@idea.reload.downvotes_count).to eq 0
      end
    end

    describe 'when voting idea is allowed by moderators/admins' do
      before do
        PermissionsService.new.update_all_permissions
        project = @idea.project
        project.permissions.find_by(action: 'voting_idea').update!(permitted_by: 'admins_moderators')
        @user.update!(roles: [])
      end

      example_request '[error] Upvote an idea in a project where voting is not permitted' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq 'not_permitted'
        expect(@idea.reload.upvotes_count).to eq 2
        expect(@idea.reload.downvotes_count).to eq 0
      end
    end

    describe do
      before do
        project = @idea.project
        project.update(upvoting_method: 'limited', upvoting_limited_max: 1)
        create(:vote, mode: 'up', votable: create(:idea, project: project), user: @user)
      end

      example_request '[error] Upvote an idea in a project where you can upvote only once' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq ParticipationContextService::VOTING_DISABLED_REASONS[:upvoting_limited_max_reached]
        expect(@idea.reload.upvotes_count).to eq 2
        expect(@idea.reload.downvotes_count).to eq 0
      end
    end
  end

  post 'web_api/v1/ideas/:idea_id/votes/down' do
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "Downvote an idea that doesn't have your vote yet" do
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

    example 'Downvote an idea that you upvoted before' do
      @idea.votes.create(user: @user, mode: 'up')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

    example '[error] Downvote an idea that you downvoted before' do
      @idea.votes.create(user: @user, mode: 'down')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_downvoted')
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

    example '[error] Downvote in a project where downvoting is disabled', document: false do
      @project.update! downvoting_enabled: false
      @idea.votes.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 401
      json_response = json_parse(response_body)
      expect(json_response[:errors][:base][0][:error]).to eq ParticipationContextService::VOTING_DISABLED_REASONS[:downvoting_disabled]
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end
  end

  delete 'web_api/v1/votes/:id' do
    let(:vote) { create(:vote, user: @user, votable: @idea) }
    let(:id) { vote.id }

    example_request 'Delete a vote from an idea' do
      expect(response_status).to eq 200
      expect { Vote.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
