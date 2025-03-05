# frozen_string_literal: true

require 'rails_helper'

describe Analysis::HeatmapGenerator do
  let!(:custom_field_gender) { create(:custom_field_gender, :with_options) }
  let!(:project) { create(:project_with_active_ideation_phase) }
  let!(:phase) { project.phases.first }
  let!(:custom_form) { create(:custom_form, participation_context: project) }
  let!(:custom_field1) { create(:custom_field_select, :with_options, resource: custom_form) }
  let!(:author1) { create(:user, custom_field_values: { custom_field_gender.key => custom_field_gender.options[0].key }) }
  let!(:input1) { create(:idea, author: author1, project: project, custom_field_values: { custom_field1.key => custom_field1.options[0].key }) }
  let!(:input2) { create(:idea, project: project, custom_field_values: { custom_field1.key => custom_field1.options[1].key }) }
  let!(:analysis) { create(:ideation_analysis, project:, additional_custom_fields: custom_form.custom_fields) }
  let!(:tag1) { create(:tag, analysis: analysis) }
  let!(:tag2) { create(:tag, analysis: analysis) }
  let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
  let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
  let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

  describe '#generate' do
    it 'returns an empty result for empty categories' do
      service = described_class.new(analysis)
      heatmap = service.generate([], [])
      expect(heatmap).to eq({})
    end

    it 'returns a heatmap' do
      male, female, unspecified = custom_field_gender.options
      service = described_class.new(analysis)
      heatmap = service.generate([tag1, tag2], custom_field_gender.options)
      expect(heatmap.keys).to match_array([
        [tag1, male],
        [tag1, female],
        [tag1, unspecified],
        [tag2, male],
        [tag2, female],
        [tag2, unspecified]
      ])
      expect(heatmap.values).to all(be_instance_of(described_class::HeatmapCell))
      expect(heatmap[[tag1, male]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        chi_square: 0.0
      )
    end
  end
end
