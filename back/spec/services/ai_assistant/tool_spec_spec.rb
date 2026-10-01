# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ToolSpec do
  it 'treats tools without annotations as write tools' do
    tool_class = Class.new(McpServer::Tools::GetFormFields) { def annotations = nil }

    expect(described_class.new(tool_class:)).not_to be_read_only
  end

  it 'tags the activities of the tools it runs with the assistant channel' do
    phase = create(:native_survey_phase, project: create(:project, :draft))
    spec = described_class.new(tool_class: McpServer::Tools::ReplaceFormFields)
    fields = [
      { 'input_type' => 'page', 'page_layout' => 'default', 'title_multiloc' => {} },
      { 'input_type' => 'page', 'page_layout' => 'default', 'key' => 'form_end', 'title_multiloc' => {} }
    ]

    expect { spec.call(create(:super_admin), { 'container_type' => 'phase', 'container_id' => phase.id, 'fields' => fields }) }
      .to have_enqueued_job(LogActivityJob).with(anything, anything, anything, anything, hash_including(channel: 'ai_assistant')).at_least(:once)
  end

  it 'returns invalid arguments as an error result' do
    result = described_class.new(tool_class: McpServer::Tools::GetFormFields).call(create(:super_admin), { 'container_type' => 'nope' })

    expect(result).to have_attributes(error: true, text: start_with('Error: Invalid arguments'))
  end
end
