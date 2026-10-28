# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::AnalysisInsight do
  let(:analysis) { create(:analysis) }

  it 'exposes a summary with its filters and source inputs' do
    idea = create(:idea, project: analysis.project)
    summary = create(
      :summary,
      summary: "Most want more trees [#{idea.id}].",
      accuracy: 0.8,
      insight_attributes: { analysis: analysis, filters: { 'search' => 'trees' }, inputs_ids: [idea.id] }
    )
    row = described_class.find(summary.insight.id)

    expect(row.analysis_id).to eq analysis.id
    expect(row.project_id).to eq analysis.project_id
    expect(row.kind).to eq 'summary'
    expect(row.question).to be_nil
    expect(row.body).to eq "Most want more trees [#{idea.id}]."
    expect(row.filters).to eq('search' => 'trees')
    expect(row.input_ids).to eq [idea.id]
    expect(row.accuracy).to eq 0.8
  end

  it 'exposes a question with its answer' do
    question = create(
      :analysis_question,
      question: 'What do people say about parking?',
      answer: 'They want fewer spaces.',
      insight_attributes: { analysis: analysis, filters: {} }
    )
    row = described_class.find(question.insight.id)

    expect(row.kind).to eq 'question'
    expect(row.question).to eq 'What do people say about parking?'
    expect(row.body).to eq 'They want fewer spaces.'
  end

  it 'leaves out insights that have no text yet' do
    question = create(:analysis_question, answer: nil, insight_attributes: { analysis: analysis, filters: {} })

    expect(described_class.where(id: question.insight.id)).to be_empty
  end

  it 'gives the project of an analysis that covers a single phase' do
    phase_analysis = create(:survey_analysis)
    summary = create(:summary, insight_attributes: { analysis: phase_analysis, filters: {} })
    row = described_class.find(summary.insight.id)

    expect(row.phase_id).to eq phase_analysis.phase_id
    expect(row.project_id).to eq phase_analysis.phase.project_id
  end

  # The view names each insightable type. If another type is added, this fails:
  # add it to the view's kind and text columns.
  it 'knows every insight type' do
    types = Analysis::Insight.insightable_types

    expect(types).to match_array %w[Analysis::Summary Analysis::Question]
  end
end
