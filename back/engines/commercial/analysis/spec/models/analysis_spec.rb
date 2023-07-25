# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::Analysis do
  subject { build(:analysis) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'validate project_or_phase_form_context' do
    it 'is not valid when both a project and phase are set' do
      analysis = build(:analysis, project: build(:project), phase: build(:phase))
      expect(analysis).to be_invalid
    end

    it 'is valid when only a project is set' do
      analysis = build(:analysis, project: build(:project), phase: nil)
      expect(analysis).to be_valid
    end

    it 'is valid when only a phase is set' do
      analysis = build(:analysis, project: false, phase: build(:native_survey_phase))
      expect(analysis).to be_valid
    end
  end

  describe 'validates project_or_phase_form_context' do
    it 'is valid for a continuous ideation project' do
      project = build(:continuous_project)
      analysis = build(:analysis, project: project)
      expect(analysis).to be_valid
    end

    it 'is valid for a continuous survey project' do
      project = build(:continuous_native_survey_project)
      analysis = build(:analysis, project: project, phase: nil)
      expect(analysis).to be_valid
    end

    it 'is valid for a survey phase' do
      phase = build(:native_survey_phase)
      analysis = build(:analysis, phase: phase, project: nil)
      expect(analysis).to be_valid
    end

    it 'is not valid for an ideation phase' do
      phase = build(:phase)
      analysis = build(:analysis, phase: phase, project: nil)
      expect(analysis).to be_invalid
    end

    it 'is not valid for a voting phase' do
      phase = build(:voting_phase)
      analysis = build(:analysis, phase: phase, project: nil)
      expect(analysis).to be_invalid
    end

    it 'is not valid for a non-input phase' do
      phase = build(:poll_phase)
      analysis = build(:analysis, phase: phase, project: nil)
      expect(analysis).to be_invalid
    end
  end
end
