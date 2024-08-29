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

  describe 'custom_fields presence' do
    { 'native survey' => :survey_analysis, 'ideation' => :ideation_analysis }.each do |method, factory|
      context method do
        let(:analysis) { create(factory) }

        it 'is not valid when no custom fields are associated' do
          analysis.main_custom_field = nil
          analysis.additional_custom_fields = []
          expect(analysis).to be_invalid
          expect(analysis.errors.details[:base]).to eq([{ error: :main_custom_field_or_additional_custom_fields_present }])
        end

        it 'is valid when no textual custom fields are associated' do
          analysis.main_custom_field = nil
          analysis.additional_custom_fields = [create(:custom_field_checkbox)]
          expect(analysis).to be_valid
        end

        it 'is valid when the main custom field is associated' do
          analysis.main_custom_field = create(:custom_field_text)
          analysis.additional_custom_fields = []
          expect(analysis).to be_valid
        end

        it 'is valid when textual additional custom fields are associated' do
          analysis.main_custom_field = nil
          analysis.additional_custom_fields = [create(:custom_field_checkbox), create(:custom_field_text), create(:custom_field_checkbox)]
          expect(analysis).to be_valid
        end
      end
    end
  end

  describe 'main_custom_field uniqueness' do
    it 'is not valid when the same custom field is used for multiple analyses' do
      custom_field = create(:custom_field_text)
      create(:analysis, main_custom_field: custom_field)
      analysis = build(:analysis, main_custom_field: custom_field)
      expect(analysis).to be_invalid
      expect(analysis.errors.details[:main_custom_field_id]).to eq([{ error: :taken, value: custom_field.id }])
    end
  end

  describe 'main_field_is_textual' do
    it 'is not valid when the main custom field is not textual' do
      custom_field = create(:custom_field_checkbox)
      analysis = build(:survey_analysis, main_custom_field: custom_field)
      expect(analysis).to be_invalid
      expect(analysis.errors.details[:base]).to include({ error: :main_custom_field_not_textual })
    end
  end

  describe 'main_field_not_in_additional_fields' do
    it 'is not valid when the main custom field is also in the additional fields' do
      custom_field = create(:custom_field_text)
      analysis = build(:survey_analysis, main_custom_field: custom_field, additional_custom_fields: [custom_field])
      expect(analysis).to be_invalid
      expect(analysis.errors.details[:base]).to eq([{ error: :main_custom_field_in_additional_fields }])
    end
  end

  describe 'associated_custom_fields' do
    it 'returns the main custom field before the additional custom fields' do
      main_custom_field = create(:custom_field_text)
      additional_custom_field = create(:custom_field_text)
      analysis = build(:survey_analysis, main_custom_field: main_custom_field, additional_custom_fields: [additional_custom_field])
      expect(analysis.associated_custom_fields).to eq([main_custom_field, additional_custom_field])
    end

    it 'returns the additional custom fields when there is no main custom field' do
      additional_custom_field = create(:custom_field_text)
      analysis = build(:analysis, project: create(:single_phase_ideation_project), phase: nil, main_custom_field: nil, additional_custom_fields: [additional_custom_field])
      expect(analysis.associated_custom_fields).to eq([additional_custom_field])
    end
  end
end
