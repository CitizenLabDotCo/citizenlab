# frozen_string_literal: true

require 'rails_helper'

describe Analysis::PhaseToText do
  describe '#execute' do
    it 'includes phase and project attributes' do
      service = described_class.new
      project = build(:project, title_multiloc: { en: 'Renewing the park' }, description_multiloc: { en: 'Help us make the park great again!' })
      phase = build(
        :phase,
        project: project,
        title_multiloc: { en: 'Collecting ideas' },
        description_multiloc: { en: 'Submit all your awesome ideas here!' }
      )
      expect(service.execute(phase)).to eq({
        'Project title' => 'Renewing the park',
        'Project description' => 'Help us make the park great again!',
        'Phase title' => 'Collecting ideas',
        'Phase description' => 'Submit all your awesome ideas here!'
      })
    end
  end
end
