# frozen_string_literal: true

require 'rails_helper'

describe Analysis::AutoInsightsService do
  describe '#generate' do
    context 'with a mix of custom fields' do
      let!(:custom_field_gender) { create(:custom_field_gender, :with_options) }
      let!(:project) { create(:project_with_active_ideation_phase) }
      let!(:phase) { project.phases.first }
      let!(:custom_form) { create(:custom_form, participation_context: project) }
      let!(:custom_field1) { create(:custom_field_select, :with_options, resource: custom_form) }
      let!(:custom_field2) { create(:custom_field_linear_scale, resource: custom_form, maximum: 3) }
      let!(:author1) { create(:user, custom_field_values: { custom_field_gender.key => custom_field_gender.options[0].key }) }
      let!(:input1) { create(:idea, author: author1, project:, custom_field_values: { custom_field2.key => 2 }) }
      let!(:input2) { create(:idea, project:, custom_field_values: { custom_field1.key => custom_field1.options[1].key }) }
      let!(:analysis) { create(:ideation_analysis, project:, additional_custom_fields: custom_form.custom_fields) }
      let!(:tag1) { create(:tag, analysis:) }
      let!(:tag2) { create(:tag, analysis:) }
      let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
      let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
      let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

      it 'creates a heatmap for posts' do
        service = described_class.new(analysis)
        # We have:
        # - 2 tags
        # - 3 genders
        # - 2 options in custom_field1
        # - 3 linear scale bins in custom_field2
        # So we should get ((2*3+2*2+2*3)+(3*2+3*3)+(2*3))*2=(16+15+6)*2=74 cells
        expect { service.generate }.to change { analysis.heatmap_cells.count }.from(0).to(37)
        male, female, unspecified = custom_field_gender.options.map { |o| o.custom_field_bins.first }
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

        bin2 = custom_field2.custom_field_bins[1]
        expect(Analysis::HeatmapCell.find_by(row: tag1, column: bin2)).to have_attributes(
          count: 1,
          p_value: 1.0,
          lift: 1.0,
          row: tag1,
          column: bin2
        )
      end

      it 'creates a heatmap for likes' do
        create(:reaction, user: author1, reactable: input1)
        create(:reaction, reactable: input1)
        create(:reaction, reactable: input1)

        service = described_class.new(analysis)
        expect { service.generate(unit: 'likes') }.to change { analysis.heatmap_cells.count }.from(0).to(37)
        male, female, _unspecified = custom_field_gender.options.map { |o| o.custom_field_bins.first }

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

        male, female, _unspecified = custom_field_gender.options.map { |o| o.custom_field_bins.first }

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
          p_value: 1,
          lift: 0.933333333333333,
          row: tag2,
          column: male,
          unit: 'participants'
        )
        expect(Analysis::HeatmapCell.find_by(row: tag2, column: female)).to have_attributes(
          count: 1,
          p_value: 1.0,
          lift: 1.166666666666667,
          row: tag2,
          column: female,
          unit: 'participants'
        )
      end
    end

    context 'with a domicile custom field' do
      let!(:custom_field_domicile) { create(:custom_field_domicile) }
      let!(:areas) { create_list(:area, 2) }
      let!(:project) { create(:project_with_active_ideation_phase) }
      let!(:phase) { project.phases.first }
      let!(:author1) { create(:user, custom_field_values: { custom_field_domicile.key => areas[0].id }) }
      let!(:input1) { create(:idea, project:, author: author1) }
      let!(:input2) { create(:idea, project:) }
      let!(:analysis) { create(:ideation_analysis, project:) }
      let!(:tag1) { create(:tag, analysis:) }
      let!(:tag2) { create(:tag, analysis:) }
      let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
      let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
      let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

      it 'works well with the domicile custom field' do
        service = described_class.new(analysis)
        expect { service.generate }.to change { analysis.heatmap_cells.count }.from(0).to(6)
        bin0 = areas[0].custom_field_option.custom_field_bins.first
        expect(Analysis::HeatmapCell.find_by(row: tag1, column: bin0)).to have_attributes(
          count: 1,
          p_value: 1.0,
          lift: 1,
          row: tag1,
          column: bin0
        )
      end
    end

    context 'with a birthyear custom field' do
      let!(:custom_field_birthyear) { create(:custom_field_birthyear) }
      let!(:areas) { create_list(:area, 2) }
      let!(:project) { create(:project_with_active_ideation_phase) }
      let!(:phase) { project.phases.first }
      let!(:author1) { create(:user, custom_field_values: { custom_field_birthyear.key => 2003 }) }
      let!(:input1) { create(:idea, project:, author: author1) }
      let!(:input2) { create(:idea, project:) }
      let!(:analysis) { create(:ideation_analysis, project:) }
      let!(:tag1) { create(:tag, analysis:) }
      let!(:tag2) { create(:tag, analysis:) }
      let!(:tagging11) { create(:tagging, tag: tag1, input: input1) }
      let!(:tagging12) { create(:tagging, tag: tag2, input: input1) }
      let!(:tagging31) { create(:tagging, tag: tag1, input: input2) }

      it 'works well with the birthyear custom field' do
        service = described_class.new(analysis)
        travel_to(Date.parse('2025-03-18')) do
          expect { service.generate }.to change { analysis.heatmap_cells.count }.from(0).to(10)
          bin2040 = CustomFieldBin.find_by(custom_field: custom_field_birthyear, range: 20...40)
          expect(Analysis::HeatmapCell.find_by(row: tag1, column: bin2040)).to have_attributes(
            count: 1,
            p_value: 1.0,
            lift: 1.0,
            row: tag1,
            column: bin2040
          )
        end
      end
    end
  end
end
