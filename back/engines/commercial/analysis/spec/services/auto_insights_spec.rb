# frozen_string_literal: true

require 'rails_helper'

describe Analysis::AutoInsightsService, skip: 'Probably throwaway code, needs refactoring to be combined with HeatmapGenerator' do
  let!(:custom_field_gender) { create(:custom_field_gender, :with_options) }
  let!(:project) { create(:project_with_active_native_survey_phase) }
  let!(:phase) { project.phases.first }
  let!(:custom_form) { create(:custom_form, participation_context: phase) }
  let!(:custom_field1) { create(:custom_field_select, :with_options, resource: custom_form) }
  let!(:author1) { create(:user, custom_field_values: { custom_field_gender.key => custom_field_gender.options[0].key }) }
  let!(:input1) { create(:idea, author: author1, project: project, creation_phase: phase, custom_field_values: { custom_field1.key => custom_field1.options[0].key }) }
  let!(:input2) { create(:idea, project: project, creation_phase: phase, custom_field_values: { custom_field1.key => custom_field1.options[1].key }) }
  let!(:analysis) { create(:survey_analysis, phase: phase, additional_custom_fields: custom_form.custom_fields) }
  let!(:tag1) { create(:tag, analysis: analysis) }
  let!(:tag2) { create(:tag, analysis: analysis) }
  let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
  let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
  let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

  describe '#big_fat_matrix' do
    it 'returns a big fat matrix for surveys' do
      service = described_class.new(analysis)
      bfm = service.big_fat_matrix
      expect(bfm).to eq([])
    end
  end

  describe '#call' do
    it 'returns strongest auto-insights' do
      service = described_class.new(analysis)
      expect(service.chi_square_analysis).to eq([])
    end
  end
end
