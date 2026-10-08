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
    get_form_fields = context.tool('get_form_fields')

    expect(get_form_fields.llm_schema).to include('properties' => {}, 'required' => [], 'additionalProperties' => false)
  end

  it 'describes the survey in the system prompt' do
    prompt = context.system_prompt(locale: 'en')

    expect(prompt).to include(phase.title_multiloc['en'], phase.project.title_multiloc['en'])
  end
end
