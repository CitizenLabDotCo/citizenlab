# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreatePhase do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, admin_publication_attributes: { publication_status: status }) }
  let(:params) do
    {
      project_id: project.id,
      title_multiloc: { 'en' => 'P1' },
      start_at: '2026-07-01',
      end_at: '2026-08-01',
      participation_method: 'ideation'
    }
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates the phase' do
      response = nil
      expect do
        response = run_mcp_tool(described_class, params:, current_user:)
      end.to change { project.reload.phases.count }.by(1)

      expect(response).not_to be_error
    end
  end

  context 'when the project is published' do
    let(:status) { 'published' }

    it 'returns an isError response and does not create the phase' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).to be_unauthorized_project
      expect(project.reload.phases.count).to eq(0)
    end
  end

  context 'when the project_id does not exist' do
    let(:status) { 'draft' }

    it 'returns a Project not found error' do
      response = run_mcp_tool(
        described_class,
        params: params.merge(project_id: SecureRandom.uuid),
        current_user:
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to include('Project not found')
    end
  end

  # The input schema advertises the union of participation methods and prescreening
  # modes on every tenant (tenant-agnostic definitions); the feature gates are
  # enforced at call time instead.
  describe 'feature gates' do
    let(:status) { 'draft' }

    context 'when the participation method is gated by a disabled feature' do
      before { SettingsService.new.deactivate_feature!('polls') }

      it 'returns an error naming the missing feature and creates nothing' do
        response = nil
        expect do
          response = run_mcp_tool(
            described_class,
            params: params.merge(participation_method: 'poll'),
            current_user:
          )
        end.not_to change(Phase, :count)

        expect(response).to be_error
        expect(response.content.first[:text]).to include("'polls' feature")
      end
    end

    context 'when the participation method is gated by an enabled feature' do
      before { SettingsService.new.activate_feature!('polls') }

      it 'creates the phase' do
        response = run_mcp_tool(
          described_class,
          params: params.merge(participation_method: 'poll'),
          current_user:
        )

        expect(response).not_to be_error
        expect(project.reload.phases.sole.participation_method).to eq('poll')
      end
    end

    it 'rejects prescreening_mode when no prescreening feature is enabled' do
      SettingsService.new.deactivate_feature!('prescreening')
      SettingsService.new.deactivate_feature!('prescreening_ideation')

      response = run_mcp_tool(
        described_class,
        params: params.merge(prescreening_mode: 'all'),
        current_user:
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to include('prescreening')
    end

    it 'rejects reacting_dislike_* fields when the disable_disliking feature is off' do
      SettingsService.new.deactivate_feature!('disable_disliking')

      response = run_mcp_tool(
        described_class,
        params: params.merge(reacting_dislike_enabled: true),
        current_user:
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to include("'disable_disliking' feature")
    end
  end

  describe 'participation method coverage' do
    # Methods deliberately not offered by the tool. 'community_monitor_survey' belongs to
    # the community monitor, a singleton internal project (Project::INTERNAL_ROLES) whose
    # phase is provisioned by the platform rather than created through this tool.
    let(:unoffered_methods) { %w[community_monitor_survey] }

    # Fails when a new participation method is added without deciding, here, whether the
    # tool offers it and behind which feature flag. GATED_METHODS/UNGATED_METHODS feed the
    # schema enum through an intersection, which would otherwise drop it silently.
    it 'classifies every participation method as gated, ungated or unoffered' do
      classified = described_class::GATED_METHODS.keys + described_class::UNGATED_METHODS + unoffered_methods

      expect(classified).to match_array(Phase::PARTICIPATION_METHODS)
    end
  end
end
