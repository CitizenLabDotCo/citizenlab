# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Votes' do
  explanation 'Votes are used to express agreement on content (i.e. ideas). Ideally, the city would accept the most voted initiatives.'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'

    @status_proposed = create(:initiative_status_proposed)
    @status_expired = create(:initiative_status_expired)
    @status_threshold_reached = create(:initiative_status_threshold_reached)
    @status_answered = create(:initiative_status_answered)
    @status_ineligible = create(:initiative_status_ineligible)

    @initiative = create(:initiative)

    @initiative.initiative_status_changes.create!(
      initiative_status: @status_proposed
    )
    @votes = create_list(:vote, 2, votable: @initiative, mode: 'up')
  end

  get 'web_api/v1/initiatives/:initiative_id/votes' do
    let(:initiative_id) { @initiative.id }

    example_request 'List all votes of an initiative' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/votes/:id' do
    let(:id) { @votes.first.id }

    example_request 'Get one vote on an initiative by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @votes.first.id
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/votes' do
    with_options scope: :vote do
      parameter :user_id, 'The user id of the user owning the vote. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }
    let(:mode) { 'up' }

    example_request 'Create a vote to an initiative' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@initiative.reload.upvotes_count).to eq 3
    end

    example 'Reaching the voting threshold immediately triggers status change', document: false do
      settings = AppConfiguration.instance.settings
      settings['initiatives']['voting_threshold'] = 3
      AppConfiguration.instance.update! settings: settings

      do_request
      assert_status 201
      expect(@initiative.reload.initiative_status).to eq @status_threshold_reached
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/votes/up' do
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }

    example_request "Upvote an initiative that doesn't have your vote yet" do
      assert_status 201
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end

    example 'Upvote an initiative that you downvoted before' do
      @initiative.votes.create(user: @user, mode: 'down')
      do_request
      assert_status 201
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end

    example '[error] Upvote an initiative that you upvoted before' do
      @initiative.votes.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_upvoted')
      expect(@initiative.reload.upvotes_count).to eq 3
      expect(@initiative.reload.downvotes_count).to eq 0
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/votes/down' do
    ValidationErrorHelper.new.error_fields(self, Vote)

    disabled_reasons = ParticipationContextService::VOTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }

    example_request "[error] Downvote an initiative that doesn't have your vote yet" do
      assert_status 401
      json_response = json_parse(response_body)
      expect(json_response.dig(:errors, :base)).to include({ error: 'downvoting_not_supported' })
      expect(@initiative.reload.upvotes_count).to eq 2
      expect(@initiative.reload.downvotes_count).to eq 0
    end
  end

  delete 'web_api/v1/votes/:id' do
    let(:vote) { create(:vote, user: @user, votable: @initiative) }
    let(:id) { vote.id }

    example_request 'Delete a vote from an initiative' do
      assert_status 200
      expect { Vote.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
