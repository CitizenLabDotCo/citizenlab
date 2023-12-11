# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::Analysis do
  subject { build(:analysis, project: create(:single_phase_ideation_project)) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'validate project_or_phase_form_context' do
    it 'is not valid when both a project and phase are set' do
      analysis = build(:analysis, project: create(:single_phase_ideation_project), phase: create(:phase))
      expect(analysis).to be_invalid
    end

    it 'is valid for a single phase ideation project' do
      analysis = build(:analysis, project: create(:single_phase_ideation_project), phase: nil)
      expect(analysis).to be_valid
    end

    it 'is valid for a single phase voting project' do
      analysis = build(:analysis, project: create(:single_phase_budgeting_project), phase: nil)
      expect(analysis).to be_valid
    end

    it 'is valid for a native survey phase' do
      analysis = build(:analysis, project: false, phase: create(:native_survey_phase))
      expect(analysis).to be_valid
    end

    it 'is not valid for an single phase survey project' do
      analysis = build(:analysis, project: create(:single_phase_native_survey_project), phase: nil)
      expect(analysis).not_to be_valid
    end

    it 'is not valid for an ideation phase' do
      analysis = build(:analysis, phase: create(:phase), project: nil)
      expect(analysis).to be_invalid
    end

    it 'is not valid for a voting phase' do
      analysis = build(:analysis, phase: create(:single_voting_phase), project: nil)
      expect(analysis).to be_invalid
    end

    it 'is not valid for a non-input phase' do
      analysis = build(:analysis, phase: create(:poll_phase), project: nil)
      expect(analysis).to be_invalid
    end
  end
end
