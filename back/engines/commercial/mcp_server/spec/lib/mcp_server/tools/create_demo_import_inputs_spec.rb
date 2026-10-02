# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateDemoImportInputs do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }
  let(:phase) { create(:native_survey_phase, project:) }

  def create_import_inputs(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  before do
    change_lifecycle_stage('demo')
    SettingsService.new.activate_feature!('input_importer')
  end

  # One draft import input matches the Input Importer's draft_records query.
  def draft_records(phase)
    creation_phase_id = phase.pmethod.transitive? ? nil : phase.id
    Idea.draft.in_phase(phase).joins(:idea_import)
      .where(project_id: phase.project_id, creation_phase_id:)
  end

  it 'creates draft inputs with an import record and an attached scan' do
    url = 'https://example.com/scan.pdf'
    stub_remote_file_download(url)

    response = create_import_inputs(
      phase_id: phase.id,
      inputs: [{ custom_field_values: {}, scan_pdf_url: url }]
    )

    expect(response).not_to be_error
    idea_id = response.structured_content[:idea_ids].sole
    idea = Idea.find(idea_id)
    expect(idea).to be_draft
    expect(idea.author.email).to end_with("@#{McpServer::DemoData::EMAIL_DOMAIN}")
    expect(idea.idea_import).to be_present
    expect(idea.idea_import.file.file).to be_present
    # It shows up in the importer's review queue.
    expect(draft_records(phase)).to include(idea)
  end

  it 'creates a draft input without a scan when no url is given' do
    response = create_import_inputs(phase_id: phase.id, inputs: [{ custom_field_values: {} }])

    expect(response).not_to be_error
    idea = Idea.find(response.structured_content[:idea_ids].sole)
    expect(idea.idea_import).to be_present
    expect(idea.idea_import.file).to be_nil
    expect(draft_records(phase)).to include(idea)
  end

  context 'with an ideation phase' do
    let(:phase) { create(:phase, project:, participation_method: 'ideation') }

    it 'sets creation_phase to nil (transitive) so the input still matches the importer query' do
      response = create_import_inputs(
        phase_id: phase.id,
        inputs: [{ title_multiloc: { 'en' => 'Idea' }, body_multiloc: { 'en' => '<p>Body</p>' } }]
      )

      expect(response).not_to be_error
      idea = Idea.find(response.structured_content[:idea_ids].sole)
      expect(idea.creation_phase_id).to be_nil
      expect(draft_records(phase)).to include(idea)
    end
  end

  it 'reports a per-input scan error without aborting the other inputs' do
    good = 'https://example.com/good.pdf'
    bad = 'https://example.com/missing.pdf'
    stub_remote_file_download(good)
    stub_failing_remote_download(bad, status: 404)

    response = create_import_inputs(
      phase_id: phase.id,
      inputs: [{ custom_field_values: {}, scan_pdf_url: good }, { custom_field_values: {}, scan_pdf_url: bad }]
    )

    expect(response).not_to be_error
    expect(response.structured_content[:idea_ids].size).to eq(1)
    expect(response.structured_content[:scan_errors].sole).to include(index: 1)
  end

  it 'refuses on a non-demo/trial platform' do
    change_lifecycle_stage('active')

    response = create_import_inputs(phase_id: phase.id, inputs: [{ custom_field_values: {} }])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('demo and trial')
    expect(Idea.count).to eq(0)
  end

  it 'refuses when the input_importer feature is disabled' do
    SettingsService.new.deactivate_feature!('input_importer')

    response = create_import_inputs(phase_id: phase.id, inputs: [{ custom_field_values: {} }])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('input_importer')
  end

  it 'refuses on a participation method the importer does not support' do
    poll_phase = create(:poll_phase, project:)

    response = create_import_inputs(phase_id: poll_phase.id, inputs: [{ custom_field_values: {} }])

    expect(response).to be_error
    expect(response.content.first[:text]).to include('only supported for')
  end

  it 'returns a not-found error for a missing phase' do
    response = create_import_inputs(phase_id: SecureRandom.uuid, inputs: [{ custom_field_values: {} }])

    expect(response).to be_not_found('Phase')
  end
end
