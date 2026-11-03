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

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  describe '#input_schema' do
    def schema = described_class.new.input_schema

    # The Runner splats params into Phase.new, so undeclared properties must be
    # rejected at dispatch (mass-assignment guard).
    it 'rejects undeclared properties' do
      expect(schema[:additionalProperties]).to be(false)
    end

    # The schema deliberately advertises the union of participation methods,
    # prescreening modes and disliking fields regardless of which features the tenant
    # has: definitions must be identical on every tenant (tool_definitions_parity_spec).
    # The flags are enforced at call time instead — see the 'feature gates' block below.
    it 'advertises every offered participation method regardless of feature flags' do
      SettingsService.new.deactivate_feature!('polls')

      expect(schema.dig(:properties, :participation_method, :enum)).to include('poll')
      expect(schema.dig(:properties, :prescreening_mode, :enum)).to eq([nil, 'all', 'flagged_only'])
      expect(schema[:properties].keys).to include(
        :reacting_dislike_enabled,
        :reacting_dislike_method,
        :reacting_dislike_limited_max
      )
    end
  end

  context 'when the project is draft' do
    let(:status) { 'draft' }

    it 'creates an ideation phase' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).not_to be_error
      phase = project.phases.sole
      expect(phase.participation_method).to eq('ideation')
      expect(response.structured_content[:id]).to eq(phase.id)
    end

    it 'creates a native survey phase' do
      response = run(params.merge(
        participation_method: 'native_survey',
        native_survey_title_multiloc: { 'en' => 'Survey' },
        native_survey_button_multiloc: { 'en' => 'Take the survey' }
      ))

      expect(response).not_to be_error
      phase = project.phases.sole
      expect(phase.participation_method).to eq('native_survey')
      expect(phase.native_survey_title_multiloc).to eq('en' => 'Survey')
    end

    it 'creates a standalone survey phase overlapping the timeline' do
      create(:phase, project:, start_at: '2026-06-01', end_at: '2026-09-01')

      response = run(params.merge(
        participation_method: 'native_survey',
        placement_type: 'standalone',
        native_survey_title_multiloc: { 'en' => 'Survey' },
        native_survey_button_multiloc: { 'en' => 'Take the survey' }
      ))

      expect(response).not_to be_error
      phase = project.phases.find_by(placement_type: 'standalone')
      expect(phase.participation_method).to eq('native_survey')
    end

    it 'creates a budgeting voting phase' do
      response = run(params.merge(
        participation_method: 'voting',
        voting_method: 'budgeting',
        voting_max_total: 1000
      ))

      expect(response).not_to be_error
      phase = project.phases.sole
      expect(phase.voting_method).to eq('budgeting')
      expect(phase.voting_max_total).to eq(1000)
    end

    it 'creates a poll phase when the polls feature is active' do
      SettingsService.new.activate_feature!('polls')

      response = run(params.merge(participation_method: 'poll'))

      expect(response).not_to be_error
      expect(project.phases.sole.participation_method).to eq('poll')
    end

    it 'returns structured validation errors for invalid params' do
      response = nil

      expect { response = run(params.merge(end_at: '2026-06-01')) }.not_to change(Phase, :count)

      expect(response).to be_error
      error = response.structured_content[:errors].sole
      expect(error).to include(
        attribute: 'base',
        error: :duration_too_short,
        message: be_present
      )
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
      response = run(params.merge(project_id: SecureRandom.uuid))

      expect(response).to be_not_found('Project')
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
