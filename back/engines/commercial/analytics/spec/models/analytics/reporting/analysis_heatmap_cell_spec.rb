# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::AnalysisHeatmapCell do
  it 'exposes a tag-by-answer cell with readable sides and its statistics' do
    analysis = create(:analysis)
    tag = create(:tag, analysis: analysis, name: 'Cycling')
    bin = create(:option_bin, option_attrs: { title_multiloc: { 'en' => 'Female' } })
    cell = create(:heatmap_cell, analysis: analysis, row: tag, column: bin, unit: 'participants', count: 12, lift: 1.3, p_value: 0.01)
    row = described_class.find(cell.id)

    expect(row.project_id).to eq analysis.project_id
    expect(row.unit).to eq 'participants'
    expect([row.row_kind, row.row_tag_id, row.row_tag_label, row.row_question_id]).to eq ['tag', tag.id, 'Cycling', nil]
    expect(row.column_kind).to eq 'registration_question'
    expect(row.column_question_id).to eq bin.custom_field_id
    expect(row.column_question_label).to eq bin.custom_field.title_multiloc['en']
    expect(row.column_answer_label).to eq 'Female'
    expect([row.count, row.lift, row.p_value]).to eq [12, 1.3, 0.01]
  end

  it 'tells form questions from registration questions' do
    bin = create(:value_bin, custom_field: create(:custom_field_linear_scale, :for_custom_form))
    cell = create(:heatmap_cell, column: bin)

    expect(described_class.find(cell.id).column_kind).to eq 'form_question'
  end

  # The view labels bins in SQL. If the platform's statements label a bin type
  # differently, this fails: change the view to match.
  describe 'bin labels match the platform heatmap statements' do
    where(:bin_factory, :attributes, :label) do
      [
        [:option_bin, { option_attrs: { title_multiloc: { 'en' => 'Yes' } } }, 'Yes'],
        [:value_bin, { values: [3] }, '3'],
        [:range_bin, { range: 1...10 }, '1 to 10'],
        [:age_bin, { range: 20...40 }, '20 to 40'],
        [:age_bin, { range: 80.. }, '80 or more']
      ]
    end

    with_them do
      it 'labels the bin as the platform does' do
        bin = create(bin_factory, **attributes)
        cell = create(:heatmap_cell, column: bin)
        statement_label = ActionController::Base.helpers.strip_tags(
          Analysis::HeatmapCellStatementGenerator.new.send(:bin_to_answer_str, bin)
        )

        expect(described_class.find(cell.id).column_answer_label).to eq label
        expect(statement_label).to eq label
      end
    end
  end

  it 'documents every unit' do
    description = described_class.field_descriptions['unit']

    expect(Analysis::HeatmapCell::UNIT_TYPES).to all(satisfy { |unit| description.include?("'#{unit}'") })
  end
end
