# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Surfaces::SurveyBuilder do
  subject(:surface) { described_class.new(phase) }

  let(:phase) { create(:native_survey_phase, project: create(:project, :draft)) }

  it 'is only available for native surveys' do
    expect(surface).to be_available
    expect(described_class.new(create(:phase))).not_to be_available
  end

  it 'hides the pinned arguments from the model' do
    get_form_fields, replace_form_fields = surface.tools

    expect(get_form_fields).to be_read_only
    expect(get_form_fields.llm_schema['properties']).to be_empty
    expect(replace_form_fields).not_to be_read_only
    expect(replace_form_fields.llm_schema).to include(
      'properties' => { 'fields' => be_present },
      'required' => ['fields'],
      'additionalProperties' => false
    )
  end

  it 'gives its own design advice without a skill' do
    prompt = surface.system_prompt(locale: 'en')

    expect(prompt).not_to include('<skill')
    expect(prompt).to include('Use at most 25 questions', 'need at least 2 options', 'Do not ask for personal data')
  end

  it 'replaces its design advice with its skill in development' do
    stub_const('AIAssistant::Skill::ROOT', Rails.root.join('spec/fixtures/llm_skills/plugins'))
    # The surface's skill is private, so the example skill stands in for it.
    example_skill = AIAssistant::Skill.find('example-skill')
    allow(AIAssistant::Skill).to receive_messages(available?: true, find: example_skill)

    prompt = surface.system_prompt(locale: 'en')

    expect(prompt).to include(
      '<skill name="example-skill">',
      'Fixture guidance from the example skill.',
      'Fixture guidance on style.'
    )
    expect(prompt).not_to include('Use at most 25 questions')
    expect(prompt).to include('Call get_form_fields to read the current form', 'need at least 2 options', 'Do not ask for personal data')
  end

  it 'pins the form version to the proposed changes' do
    form = create(:custom_form, participation_context: phase, fields_last_updated_at: 1.hour.ago)

    expect(surface.tool('replace_form_fields').pinned).to eq(
      'container_type' => 'phase',
      'container_id' => phase.id,
      'fields_last_updated_at' => form.fields_last_updated_at.iso8601
    )
  end

  it 'sees a form created since a call that pinned no version' do
    tool_call = build(:ai_assistant_tool_call, pinned_arguments: { 'container_type' => 'phase', 'container_id' => phase.id })
    expect(surface.stale?(tool_call)).to be(false)

    create(:custom_form, participation_context: phase)
    expect(surface.stale?(tool_call)).to be(true)

    tool_call.pinned_arguments['fields_last_updated_at'] = 1.hour.ago.iso8601
    expect(surface.stale?(tool_call)).to be(false)
  end

  describe '#write_call_error' do
    using RSpec::Parameterized::TableSyntax

    let(:conversation) { create(:ai_assistant_conversation, subject: phase) }

    where(:read_age, :form_age, :error) do
      nil     | nil     | 'Call get_form_fields first'
      1.hour  | nil     | nil
      1.hour  | 2.hours | nil
      2.hours | 1.hour  | 'The form changed since you last read it'
    end

    with_them do
      it 'sends the write call back to the model unless it builds on the current form' do
        if read_age
          message = create(:ai_assistant_message, conversation:, role: 'assistant', content: nil)
          create(:ai_assistant_tool_call, message:, name: 'get_form_fields', status: 'auto_executed', created_at: read_age.ago)
        end
        create(:custom_form, participation_context: phase, fields_last_updated_at: form_age.ago) if form_age

        result = surface.write_call_error(surface.tool('replace_form_fields'), conversation)

        expect(result).to(error ? start_with(error) : be_nil)
      end
    end
  end

  it 'describes the survey in the system prompt' do
    prompt = surface.system_prompt(locale: 'en')

    expect(prompt).to include(phase.title_multiloc['en'], phase.project.title_multiloc['en'], 'The survey questions can be changed.')
  end

  it 'tells the model when the survey cannot be changed' do
    phase.project.admin_publication.update!(publication_status: 'published')

    expect(surface.system_prompt(locale: 'en')).to include('cannot be changed')
  end

  it 'tells the model when the survey already has responses' do
    phase.update_columns(ideas_count: 2)

    expect(surface.system_prompt(locale: 'en')).to include('cannot be changed')
  end
end
