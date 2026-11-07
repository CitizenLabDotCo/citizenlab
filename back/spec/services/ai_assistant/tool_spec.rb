# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Tool do
  it 'is not read-only without an explicit read_only_hint' do
    tool_class = Class.new(McpServer::Tools::GetFormFields) { def annotations = nil }

    expect(described_class.new(tool_class)).not_to be_read_only
  end

  it 'tags the activities of the tools it runs with the assistant channel' do
    phase = create(:native_survey_phase, project: create(:project, :draft))
    tool = described_class.new(McpServer::Tools::ReplaceFormFields)
    fields = [
      { 'input_type' => 'page', 'page_layout' => 'default', 'title_multiloc' => {} },
      { 'input_type' => 'page', 'page_layout' => 'default', 'key' => 'form_end', 'title_multiloc' => {} }
    ]

    expect { tool.call(create(:super_admin), { 'container_type' => 'phase', 'container_id' => phase.id, 'fields' => fields }) }
      .to have_enqueued_job(LogActivityJob).with(anything, anything, anything, anything, hash_including(channel: 'ai_assistant')).at_least(:once)
  end

  it 'returns invalid arguments as an error result' do
    result = described_class.new(McpServer::Tools::GetFormFields).call(create(:super_admin), { 'container_type' => 'nope' })

    expect(result).to have_attributes(error: true, text: start_with('Error: Invalid arguments'))
  end

  it 'refuses the records it does not allow' do
    user = create(:super_admin)
    phase = create(:phase, project: create(:project, :draft))
    tool = described_class.new(McpServer::Tools::UpdatePhase, allow: ->(args) { args['phase_id'] == 'another-phase' })
    args = { 'phase_id' => phase.id, 'title_multiloc' => { 'en' => 'Renamed' } }

    expect(tool.validation_error(user, args)).to eq(described_class::OUTSIDE_SUBJECT_TEXT)
    expect(tool.call(user, args)).to have_attributes(error: true, text: "Error: #{described_class::OUTSIDE_SUBJECT_TEXT}")
    expect(phase.reload.title_multiloc['en']).not_to eq('Renamed')
  end

  it 'hides the omitted properties from the model' do
    tool = described_class.new(McpServer::Tools::UpdateProject, omit: %w[remote_header_bg_url])

    expect(tool.llm_schema['properties']).to include('title_multiloc')
    expect(tool.llm_schema['properties']).not_to include('remote_header_bg_url')
    expect(tool.hidden_keys).to include('remote_header_bg_url')
  end
end
