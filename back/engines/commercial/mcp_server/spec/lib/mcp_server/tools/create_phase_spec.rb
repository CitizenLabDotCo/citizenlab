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
    # A method, not a let: the schema is rebuilt to observe feature-flag changes.
    def schema = described_class.new.input_schema

    describe 'gated participation methods' do
      using RSpec::Parameterized::TableSyntax

      where(:participation_method, :flag) do
        'common_ground' | 'common_ground'
        'document_annotation' | 'konveio_document_annotation'
        'poll' | 'polls'
        'survey' | 'surveys'
      end

      with_them do
        it 'is only available when its feature flag is active' do
          settings = SettingsService.new
          # Features depending on the flag must be deactivated first (e.g. the
          # per-provider survey features all depend on 'surveys').
          AppConfiguration::Settings.json_schema['dependencies'].each do |depender, dependees|
            settings.deactivate_feature!(depender) if dependees.include?(flag)
          end

          settings.deactivate_feature!(flag)
          expect(schema.dig(:properties, :participation_method, :enum)).not_to include(participation_method)

          settings.activate_feature!(flag)
          expect(schema.dig(:properties, :participation_method, :enum)).to include(participation_method)
        end
      end
    end

    it 'adapts the `prescreening_mode` enum to the prescreening feature flags' do
      settings = SettingsService.new
      %w[prescreening prescreening_ideation flag_inappropriate_content].each { |flag| settings.deactivate_feature!(flag) }
      expect(schema.dig(:properties, :prescreening_mode, :enum)).to eq([nil])

      settings.activate_feature!('prescreening')
      expect(schema.dig(:properties, :prescreening_mode, :enum)).to eq([nil, 'all'])

      settings.activate_feature!('flag_inappropriate_content')
      expect(schema.dig(:properties, :prescreening_mode, :enum)).to eq([nil, 'all', 'flagged_only'])
    end

    it 'only exposes the disliking fields when `disable_disliking` is active' do
      SettingsService.new.deactivate_feature!('disable_disliking')
      expect(schema[:properties]).not_to have_key(:reacting_dislike_enabled)

      SettingsService.new.activate_feature!('disable_disliking')
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
end
