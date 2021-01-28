require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Votes" do

  explanation "Votes are used to express agreement on content (i.e. ideas). Ideally, the city would accept the most voted initiatives."

  before do
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @initiative = create(:initiative)
    TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
    @initiative.initiative_status_changes.create!(
      initiative_status: InitiativeStatus.find_by(code: 'proposed')
      )
    @votes = create_list(:vote, 2, votable: @initiative, mode: 'up')
  end

  get "web_api/v1/initiatives/:initiative_id/votes" do
    let(:initiative_id) { @initiative.id }

    example_request "List all votes of an initiative" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/votes/:id" do
    let(:id) { @votes.first.id }

    example_request "Get one vote on an initiative by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @votes.first.id
    end
  end

  post "web_api/v1/initiatives/:initiative_id/votes" do
    with_options scope: :vote do
      parameter :user_id, "The user id of the user owning the vote. Signed in user by default", required: false
      parameter :mode, "one of [up, down]", required: true
    end
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    before do
      PermissionsService.new.update_global_permissions
    end
    let(:initiative_id) { @initiative.id }
    let(:mode) { "up" }
  
    example_request "Create a vote to an initiative" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:relationships,:user,:data,:id)).to be_nil
      expect(json_response.dig(:data,:attributes,:mode)).to eq "up"
      expect(@initiative.reload.upvotes_count).to eq 3
    end

    example "Reaching the voting threshold immediately triggers status change", document: false do
      settings = AppConfiguration.instance.settings
      settings['initiatives']['voting_threshold'] = 3
      AppConfiguration.instance.update! settings: settings

      do_request
      expect(response_status).to eq 201
      expect(@initiative.reload.initiative_status.code).to eq 'threshold_reached'
    end
  end

  post "web_api/v1/initiatives/:initiative_id/votes/up" do
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    before do
      PermissionsService.new.update_global_permissions
    end
    let(:initiative_id) { @initiative.id }

    example_request "Upvote an initiative that doesn't have your vote yet" do
      expect(status).to eq 201
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end

    example "Upvote an initiative that you downvoted before" do
      @initiative.votes.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 201
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end

    example "[error] Upvote an initiative that you upvoted before" do
      @initiative.votes.create(user: @user, mode: 'up')
      do_request
      expect(status).to eq 422
      json_response = json_parse(response_body)
      expect(json_response[:errors][:base][0][:error]).to eq "already_upvoted"
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end
  end

  post "web_api/v1/initiatives/:initiative_id/votes/down" do
    ValidationErrorHelper.new.error_fields(self, Vote)
    response_field :base, "Array containing objects with signature { error: #{ParticipationContextService::VOTING_DISABLED_REASONS.values.join(' | ')} }", scope: :errors

    before do
      PermissionsService.new.update_global_permissions
    end
    let(:initiative_id) { @initiative.id }

    example_request "[error] Downvote an initiative that doesn't have your vote yet" do
      expect(status).to eq 401
      json_response = json_parse(response_body)
      expect(json_response.dig(:errors, :base)).to include({error: 'downvoting_not_supported'})
      expect(@initiative.reload.upvotes_count).to eq 2
      expect(@initiative.reload.downvotes_count).to eq 0
    end
  end

  delete "web_api/v1/votes/:id" do
    before do
      PermissionsService.new.update_global_permissions
    end
    let(:vote) { create(:vote, user: @user, votable: @initiative) }
    let(:id) { vote.id }
    
    example_request "Delete a vote from an initiative" do
      expect(response_status).to eq 200
      expect{Vote.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
