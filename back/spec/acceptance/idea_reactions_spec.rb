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

  delete 'web_api/v1/reactions/:id' do
    let(:reaction) { create(:reaction, user: @user, reactable: @idea) }
    let(:id) { reaction.id }

    example_request 'Delete a reaction from an idea' do
      expect(response_status).to eq 200
      expect { Reaction.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
