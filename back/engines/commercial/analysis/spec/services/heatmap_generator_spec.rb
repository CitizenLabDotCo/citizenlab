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

    it 'returns a heatmap for inputs' do
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
      expect(heatmap.values).to all(be_instance_of(Analysis::HeatmapCell))
      expect(heatmap[[tag1, male]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag1,
        column: male
      )
      expect(heatmap[[tag1, female]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: female
      )
      expect(heatmap[[tag1, unspecified]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: unspecified
      )
      expect(heatmap[[tag2, male]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag2,
        column: male
      )
      expect(heatmap[[tag2, female]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: female
      )
      expect(heatmap[[tag2, unspecified]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: unspecified
      )
    end

    it 'returns a heatmap for likes' do
      male, female, unspecified = custom_field_gender.options
      create(:reaction, user: author1, reactable: input1)
      create(:reaction, reactable: input1)
      create(:reaction, reactable: input1)

      service = described_class.new(analysis)
      heatmap = service.generate([tag1, tag2], custom_field_gender.options, unit: 'likes')
      expect(heatmap.keys).to match_array([
        [tag1, male],
        [tag1, female],
        [tag1, unspecified],
        [tag2, male],
        [tag2, female],
        [tag2, unspecified]
      ])
      expect(heatmap.values).to all(be_instance_of(Analysis::HeatmapCell))
      expect(heatmap[[tag1, male]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag1,
        column: male
      )
      expect(heatmap[[tag1, female]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: female
      )
      expect(heatmap[[tag2, male]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag2,
        column: male
      )
      expect(heatmap[[tag2, female]]).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: female
      )
    end

    it 'returns a heatmap for participants' do
      male, female, unspecified = custom_field_gender.options
      create(:reaction, user: author1, reactable: input2)
      create(:reaction, reactable: input1, user: create(:user, custom_field_values: { custom_field_gender.key => female.key }))
      create(:comment, idea: input2, author: create(:user, custom_field_values: { custom_field_gender.key => male.key }))

      service = described_class.new(analysis)
      heatmap = service.generate([tag1, tag2], custom_field_gender.options, unit: 'participants')
      expect(heatmap.keys).to match_array([
        [tag1, male],
        [tag1, female],
        [tag1, unspecified],
        [tag2, male],
        [tag2, female],
        [tag2, unspecified]
      ])
      expect(heatmap.values).to all(be_instance_of(Analysis::HeatmapCell))
      expect(heatmap[[tag1, male]]).to have_attributes(
        count: 3,
        p_value: 1.0,
        lift: 1.05,
        row: tag1,
        column: male
      )
      expect(heatmap[[tag1, female]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 0.875,
        row: tag1,
        column: female
      )
      expect(heatmap[[tag2, male]]).to have_attributes(
        count: 2,
        p_value: 1.0,
        lift: 0.9333333333333333,
        row: tag2,
        column: male
      )
      expect(heatmap[[tag2, female]]).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.1666666666666667,
        row: tag2,
        column: female
      )
    end
  end
end
