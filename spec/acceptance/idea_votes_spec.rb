require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Idea Votes" do
  before do
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @idea = create(:idea)
    @votes = create_list(:vote, 2, votable: @idea)
  end



  get "web_api/v1/ideas/:idea_id/votes" do
    let(:idea_id) { @idea.id }

    example_request "List votes of an idea" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/votes/:id" do
    let(:id) { @votes.first.id }

    example_request "Get one vote by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @votes.first.id
    end
  end

  post "web_api/v1/ideas/:idea_id/votes" do
    with_options scope: :vote do
      parameter :user_id, "The user id of the user owning the vote. Signed in user by default", required: false
      parameter :mode, "one of [up, down]", required: true
    end
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

  
    let(:idea_id) { @idea.id }
    let(:mode) { "up" }
  
    example_request "Create a vote to an idea" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:relationships,:user,:data,:id)).to eq @user.id
      expect(json_response.dig(:data,:attributes,:mode)).to eq "up"
      expect(@idea.reload.upvotes_count).to eq 3
    end
  end

  post "web_api/v1/ideas/:idea_id/votes/up" do
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "Upvote an idea that doesn't have your vote yet" do
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    example "Upvote an idea that you downvoted before" do
      @idea.votes.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    example "[error] Upvote an idea that you upvoted before" do
      @idea.votes.create(user: @user, mode: 'up')
      do_request
      expect(status).to eq 422
      json_response = json_parse(response_body)
      expect(json_response[:errors][:base][0][:error]).to eq "already_upvoted"
      expect(@idea.reload.upvotes_count).to eq 3
      expect(@idea.reload.downvotes_count).to eq 0
    end

    describe do
      before do
        project = @idea.project
        project.update(voting_enabled: false)
      end

      example_request "[error] Upvote an idea in a project where voting is disabled" do
        expect(status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq ParticipationContextService::VOTING_DISABLED_REASONS[:voting_disabled]
        expect(@idea.reload.upvotes_count).to eq 2
        expect(@idea.reload.downvotes_count).to eq 0
      end

    end

    describe do
      before do
        project = @idea.project
        project.update(voting_method: 'limited', voting_limited_max: 1)
        create(:vote, votable: create(:idea, project: project), user: @user)
      end

      example_request "[error] Upvote an idea in a project where you can vote only once" do
        expect(status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq ParticipationContextService::VOTING_DISABLED_REASONS[:voting_limited_max_reached]
        expect(@idea.reload.upvotes_count).to eq 2
        expect(@idea.reload.downvotes_count).to eq 0
      end

    end

  end

  post "web_api/v1/ideas/:idea_id/votes/down" do
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "downvote an idea that doesn't have your vote yet" do
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

    example "downvote an idea that you upvoted before" do
      @idea.votes.create(user: @user, mode: 'up')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

    example "[error] Downvote an idea that you downvoted before" do
      @idea.votes.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 422
      json_response = json_parse(response_body)
      expect(json_response[:errors][:base][0][:error]).to eq "already_downvoted"
      expect(@idea.reload.upvotes_count).to eq 2
      expect(@idea.reload.downvotes_count).to eq 1
    end

  end

  delete "web_api/v1/votes/:id" do
    let(:vote) { create(:vote, user: @user, votable: @idea) }
    let(:id) { vote.id }
    example_request "Delete a vote" do
      expect(response_status).to eq 200
      expect{Vote.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

end
