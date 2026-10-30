# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Surfaces::SurveyBuilder do
  subject(:surface) { described_class.new(phase) }

  let(:phase) { create(:native_survey_phase, project: create(:project, :draft)) }

  it 'is only available for native surveys' do
    expect(surface).to be_available
    expect(described_class.new(create(:phase))).not_to be_available
  end

  it 'describes the survey in the system prompt' do
    prompt = surface.system_prompt(locale: 'en')

    expect(prompt).to include(phase.title_multiloc['en'], phase.project.title_multiloc['en'])
  end
end
