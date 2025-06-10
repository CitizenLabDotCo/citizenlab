# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Reactions' do
  explanation 'Reactions are used to express agreement on content (i.e. ideas). Ideally, the city would accept the most reacted ideas.'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
    @project = create(:single_phase_ideation_project, phase_attrs: { reacting_dislike_enabled: true })
    @idea = create(:idea, project: @project, phases: @project.phases)
    @reactions = create_list(:reaction, 2, reactable: @idea)
  end

  get 'web_api/v1/ideas/:idea_id/reactions' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of reactions per page'
    end

    let(:idea_id) { @idea.id }

    example_request 'List all reactions of an idea' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/reactions/:id' do
    let(:id) { @reactions.first.id }

    example_request 'Get one reaction on an idea by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @reactions.first.id
    end
  end

  post 'web_api/v1/ideas/:idea_id/reactions' do
    with_options scope: :reaction do
      parameter :user_id, 'The user id of the user owning the reaction. Signed in user by default', required: false
      parameter :mode, 'one of [up, down]', required: true
    end
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = Permissions::PhasePermissionsService::REACTING_DENIED_REASONS.values + Permissions::PhasePermissionsService::USER_DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }
    let(:mode) { 'up' }

    example_request 'Create a reaction to an idea' do
      assert_status 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to be_nil
      expect(json_response.dig(:data, :attributes, :mode)).to eq 'up'
      expect(@idea.reload.likes_count).to eq 3
    end

    example 'Create a neutral reaction to an idea', document: false do
      do_request(reaction: { mode: 'neutral' })

      assert_status(201)

      expect(response_data).to include(
        id: be_a(String),
        type: 'reaction',
        attributes: { mode: 'neutral' }
      )

      reaction = @idea.reactions.find(response_data[:id])
      expect(reaction.mode).to eq('neutral')
    end

    describe 'When the user already reacted' do
      before do
        @reaction = create(:reaction, reactable: @idea, user: @user, mode: 'up')
      end

      example '[error] Like the same idea', document: false do
        do_request mode: 'up'
        assert_status 422
      end

      example '[error] Dislike the same idea', document: false do
        do_request mode: 'down'
        assert_status 422
      end
    end

    describe do
      let!(:status_threshold_reached) { create(:proposals_status, code: 'threshold_reached') }
      let(:phase) { create(:proposals_phase, reacting_threshold: 2) }
      let(:proposal) { create(:proposal, idea_status: create(:proposals_status, code: 'proposed'), creation_phase: phase, project: phase.project) }
      let(:idea_id) { proposal.id }

      example 'Reaching the voting threshold immediately triggers status change', document: false do
        create_list(:reaction, 2, reactable: proposal, mode: 'up')

        do_request
        assert_status 201
        expect(proposal.reload.idea_status).to eq status_threshold_reached
      end
    end
  end

  post 'web_api/v1/ideas/:idea_id/reactions/up' do
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = Permissions::PhasePermissionsService::REACTING_DENIED_REASONS.values + Permissions::PhasePermissionsService::USER_DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "Like an idea that doesn't have your reaction yet" do
      expect(status).to eq 201
      expect(@idea.reload.likes_count).to eq 3
      expect(@idea.reload.dislikes_count).to eq 0
    end

    example 'Like an idea that you disliked before' do
      @idea.reactions.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.likes_count).to eq 3
      expect(@idea.reload.dislikes_count).to eq 0
    end

    example '[error] Like an idea that you liked before' do
      @idea.reactions.create(user: @user, mode: 'up')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_liked')
      expect(@idea.reload.likes_count).to eq 3
      expect(@idea.reload.dislikes_count).to eq 0
    end

    describe 'when reacting is disabled' do
      before do
        @project.phases.first.update(reacting_enabled: false)
      end

      example_request '[error] Like an idea in a phase where reactions are disabled' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq Permissions::PhasePermissionsService::REACTING_DENIED_REASONS[:reacting_disabled]
        expect(@idea.reload.likes_count).to eq 2
        expect(@idea.reload.dislikes_count).to eq 0
      end
    end

    describe 'when reacting to idea is allowed by moderators/admins' do
      before do
        Permissions::PermissionsUpdateService.new.update_all_permissions
        @project.phases.first.permissions.find_by(action: 'reacting_idea').update!(permitted_by: 'admins_moderators')
        @user.update!(roles: [])
      end

      example_request '[error] Like an idea in a phase where reacting is not permitted' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq 'user_not_permitted'
        expect(@idea.reload.likes_count).to eq 2
        expect(@idea.reload.dislikes_count).to eq 0
      end
    end

    describe 'when likes are limited' do
      before do
        @project.phases.first.update(reacting_like_method: 'limited', reacting_like_limited_max: 1)
        create(:reaction, mode: 'up', reactable: create(:idea, project: @project, phases: @project.phases), user: @user)
      end

      example_request '[error] Like an idea in a phase where you can like only once' do
        expect(status).to eq 401
        json_response = json_parse(response_body)
        expect(json_response[:errors][:base][0][:error]).to eq Permissions::PhasePermissionsService::REACTING_DENIED_REASONS[:reacting_like_limited_max_reached]
        expect(@idea.reload.likes_count).to eq 2
        expect(@idea.reload.dislikes_count).to eq 0
      end
    end
  end

  post 'web_api/v1/ideas/:idea_id/reactions/down' do
    ValidationErrorHelper.new.error_fields(self, Reaction)

    disabled_reasons = Permissions::PhasePermissionsService::REACTING_DENIED_REASONS.values + Permissions::PhasePermissionsService::USER_DENIED_REASONS.values
    response_field :base, "Array containing objects with signature { error: #{disabled_reasons.join(' | ')} }", scope: :errors

    let(:idea_id) { @idea.id }

    example_request "Dislike an idea that doesn't have your reaction yet" do
      expect(status).to eq 201
      expect(@idea.reload.likes_count).to eq 2
      expect(@idea.reload.dislikes_count).to eq 1
    end

    example 'Dislike an idea that you liked before' do
      @idea.reactions.create(user: @user, mode: 'up')
      do_request
      expect(status).to eq 201
      expect(@idea.reload.likes_count).to eq 2
      expect(@idea.reload.dislikes_count).to eq 1
    end

    example '[error] Dislike an idea that you disliked before' do
      @idea.reactions.create(user: @user, mode: 'down')
      do_request
      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:base, 'already_disliked')
      expect(@idea.reload.likes_count).to eq 2
      expect(@idea.reload.dislikes_count).to eq 1
    end

    example '[error] Dislike in a project where disliking is disabled', document: false do
      @project.phases.first.update! reacting_dislike_enabled: false
      @idea.reactions.create(user: @user, mode: 'down')
      do_request
      expect(status).to eq 401
      json_response = json_parse(response_body)
      expect(json_response[:errors][:base][0][:error]).to eq Permissions::PhasePermissionsService::REACTING_DENIED_REASONS[:reacting_dislike_disabled]
      expect(@idea.reload.likes_count).to eq 2
      expect(@idea.reload.dislikes_count).to eq 1
    end
  end

  delete 'web_api/v1/reactions/:id' do
    let(:reaction) { create(:reaction, user: @user, reactable: @idea) }
    let(:id) { reaction.id }

    example_request 'Delete a reaction from an idea' do
      expect(response_status).to eq 200
      expect { Reaction.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
