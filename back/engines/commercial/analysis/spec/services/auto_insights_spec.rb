# frozen_string_literal: true

require 'rails_helper'

describe Analysis::AutoInsightsService do
  let!(:custom_field_gender) { create(:custom_field_gender, :with_options) }
  let!(:project) { create(:project_with_active_ideation_phase) }
  let!(:phase) { project.phases.first }
  let!(:custom_form) { create(:custom_form, participation_context: project) }
  let!(:custom_field1) { create(:custom_field_select, :with_options, resource: custom_form) }
  let!(:custom_field2) { create(:custom_field_linear_scale, resource: custom_form, maximum: 3) }
  let!(:author1) { create(:user, custom_field_values: { custom_field_gender.key => custom_field_gender.options[0].key }) }
  let!(:input1) { create(:idea, author: author1, project: project, custom_field_values: { custom_field2.key => 2 }) }
  let!(:input2) { create(:idea, project: project, custom_field_values: { custom_field1.key => custom_field1.options[1].key }) }
  let!(:analysis) { create(:ideation_analysis, project:, additional_custom_fields: custom_form.custom_fields) }
  let!(:tag1) { create(:tag, analysis: analysis) }
  let!(:tag2) { create(:tag, analysis: analysis) }
  let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
  let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
  let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

  describe '#generate' do
    it 'creates a heatmap for posts' do
      male, female, unspecified = custom_field_gender.options

      service = described_class.new(analysis)
      # We have:
      # - 2 tags
      # - 3 genders
      # - 2 options in custom_field1
      # - 3 linear scale bins in custom_field2
      # So we should get (2*3+2*2+2*3)+(3*2+3*3)+(2*3)=16+15+6=37 cells
      expect { service.generate }.to change { analysis.heatmap_cells.count }.from(0).to(37)

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: male)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag1,
        column: male
      )

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: female)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: female
      )

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: unspecified)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: unspecified
      )

      expect(Analysis::HeatmapCell.find_by(row: tag2, column: male)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag2,
        column: male
      )

      expect(Analysis::HeatmapCell.find_by(row: tag2, column: female)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: female
      )

      expect(Analysis::HeatmapCell.find_by(row: tag2, column: unspecified)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: unspecified
      )

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: custom_field2, column_bin_value: 2)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag1,
        column: custom_field2,
        column_bin_value: 2
      )
    end

    it 'creates a heatmap for likes' do
      male, female, _unspecified = custom_field_gender.options
      create(:reaction, user: author1, reactable: input1)
      create(:reaction, reactable: input1)
      create(:reaction, reactable: input1)

      service = described_class.new(analysis)
      expect { service.generate(unit: 'likes') }.to change { analysis.heatmap_cells.count }.from(0).to(37)

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: male)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag1,
        column: male,
        unit: 'likes'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag1, column: female)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag1,
        column: female,
        unit: 'likes'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag2, column: male)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.0,
        row: tag2,
        column: male,
        unit: 'likes'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag2, column: female)).to have_attributes(
        count: 0,
        p_value: 1.0,
        lift: 0.0,
        row: tag2,
        column: female,
        unit: 'likes'
      )
    end

    it 'returns a heatmap for participants' do
      male, female, _unspecified = custom_field_gender.options
      create(:reaction, user: author1, reactable: input2)
      create(:reaction, reactable: input1, user: create(:user, custom_field_values: { custom_field_gender.key => female.key }))
      create(:comment, idea: input2, author: create(:user, custom_field_values: { custom_field_gender.key => male.key }))

      service = described_class.new(analysis)
      expect { service.generate(unit: 'participants') }.to change { analysis.heatmap_cells.count }.from(0).to(37)

      expect(Analysis::HeatmapCell.find_by(row: tag1, column: male)).to have_attributes(
        count: 3,
        p_value: 1.0,
        lift: 1.05,
        row: tag1,
        column: male,
        unit: 'participants'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag1, column: female)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 0.875,
        row: tag1,
        column: female,
        unit: 'participants'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag2, column: male)).to have_attributes(
        count: 2,
        p_value: 1.0,
        lift: 0.9333333333333333,
        row: tag2,
        column: male,
        unit: 'participants'
      )
      expect(Analysis::HeatmapCell.find_by(row: tag2, column: female)).to have_attributes(
        count: 1,
        p_value: 1.0,
        lift: 1.1666666666666667,
        row: tag2,
        column: female,
        unit: 'participants'
      )
    end

    it 'works well with the domicile custom field' do
      custom_field_domicile = create(:custom_field_domicile)
      areas = create_list(:area, 2)
      author1.custom_field_values[custom_field_domicile.key] = areas[0].id
      author1.save!

      service = described_class.new(analysis)
      expect { service.generate }.to change { analysis.heatmap_cells.count }.from(0).to(58)
    end
  end
end
