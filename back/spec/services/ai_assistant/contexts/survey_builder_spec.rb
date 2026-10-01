# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Contexts::SurveyBuilder do
  subject(:context) { described_class.new(phase) }

  let(:phase) { create(:native_survey_phase, project: create(:project, :draft)) }

  it 'is only available for native surveys' do
    expect(context).to be_available
    expect(described_class.new(create(:phase))).not_to be_available
  end

  it 'hides the pinned arguments from the model' do
    get_form_fields, replace_form_fields = context.tool_specs

    expect(get_form_fields).to be_read_only
    expect(get_form_fields.llm_schema['properties']).to be_empty
    expect(replace_form_fields).not_to be_read_only
    expect(replace_form_fields.llm_schema).to include(
      'properties' => { 'fields' => be_present },
      'required' => ['fields'],
      'additionalProperties' => false
    )
  end

  it 'snapshots the form version when a change is proposed' do
    form = create(:custom_form, participation_context: phase, fields_last_updated_at: 1.hour.ago)

    expect(context.tool_spec('replace_form_fields').snapshot).to eq(
      'container_type' => 'phase',
      'container_id' => phase.id,
      'fields_last_updated_at' => form.fields_last_updated_at.iso8601
    )
  end

  it 'describes the survey in the system prompt' do
    prompt = context.system_prompt(locale: 'en')

    expect(prompt).to include(phase.title_multiloc['en'], phase.project.title_multiloc['en'], 'The survey questions can be changed.')
  end

  it 'tells the model when the survey cannot be changed' do
    phase.project.admin_publication.update!(publication_status: 'published')

    expect(context.system_prompt(locale: 'en')).to include('cannot be changed')
  end
end
