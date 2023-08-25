# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Reactions' do
  explanation 'Reactions are used to express agreement on content (i.e. ideas). Ideally, the city would accept the most reactiond initiatives.'

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
    @reactions = create_list(:reaction, 2, reactable: @initiative, mode: 'up')
  end

  get 'web_api/v1/initiatives/:initiative_id/reactions' do
    let(:initiative_id) { @initiative.id }

    example_request 'List all reactions of an initiative' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/reactions/:id' do
    let(:id) { @reactions.first.id }

    example_request 'Get one reaction on an initiative by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @reactions.first.id
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/reactions' do
    with_options scope: :reaction do
      parameter :user_id, 'The user id of the user owning the reaction. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = ParticipationContextService::REACTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }
    let(:mode) { 'up' }

    example_request 'Create a reaction to an initiative' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@initiative.reload.likes_count).to eq 3
    end

    example 'Reaching the voting threshold immediately triggers status change', document: false do
      settings = AppConfiguration.instance.settings
      settings['initiatives']['reacting_threshold'] = 3
      AppConfiguration.instance.update! settings: settings

      do_request
      assert_status 201
      expect(@initiative.reload.initiative_status).to eq @status_threshold_reached
    end

    example 'The first non-author reaction create action will set editing_locked to true', document: false do
      expect(@initiative.reload.editing_locked).to be false
      do_request
      assert_status 201
      expect(@initiative.reload.editing_locked).to be true
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/reactions/up' do
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = ParticipationContextService::REACTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }

    example_request "Like an initiative that doesn't have your reaction yet" do
      assert_status 201
      expect(@initiative.reload.likes_count).to eq 3
      expect(@initiative.reload.dislikes_count).to eq 0
    end

    example 'Like an initiative that you disliked before' do
      @initiative.reactions.create(user: @user, mode: 'down')
      do_request
      assert_status 201
      expect(@initiative.reload.likes_count).to eq 3
      expect(@initiative.reload.dislikes_count).to eq 0
    end

    example '[error] Like an initiative that you liked before' do
      @initiative.reactions.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_liked')
      expect(@initiative.reload.likes_count).to eq 3
      expect(@initiative.reload.dislikes_count).to eq 0
    end
  end

  post 'web_api/v1/initiatives/:initiative_id/reactions/down' do
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = ParticipationContextService::REACTING_DISABLED_REASONS.values + PermissionsService::DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:initiative_id) { @initiative.id }

    example_request "[error] Dislike an initiative that doesn't have your reaction yet" do
      assert_status 401
      json_response = json_parse(response_body)
      expect(json_response.dig(:errors, :base)).to include({ error: 'dislikes_not_supported' })
      expect(@initiative.reload.likes_count).to eq 2
      expect(@initiative.reload.dislikes_count).to eq 0
    end
  end

  delete 'web_api/v1/reactions/:id' do
    let(:reaction) { create(:reaction, user: @user, reactable: @initiative) }
    let(:id) { reaction.id }

    example_request 'Delete a reaction from an initiative' do
      assert_status 200
      expect { Reaction.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
