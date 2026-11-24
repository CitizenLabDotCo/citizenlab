# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::AnalysisInsight do
  let(:analysis) { create(:analysis) }

  # The task factories leave the run in progress; most examples need it finished.
  def task(factory, state = 'succeeded')
    create(factory, analysis: analysis, state: state, ended_at: (Time.now if %w[succeeded failed].include?(state)))
  end

  it 'exposes a summary with its filters and source inputs' do
    idea = create(:idea, project: analysis.project)
    summary = create(
      :summary,
      background_task: task(:summarization_task),
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
      background_task: task(:q_and_a_task),
      question: 'What do people say about parking?',
      answer: 'They want fewer spaces.',
      insight_attributes: { analysis: analysis, filters: {} }
    )
    row = described_class.find(question.insight.id)

    expect(row.kind).to eq 'question'
    expect(row.question).to eq 'What do people say about parking?'
    expect(row.body).to eq 'They want fewer spaces.'
  end

  describe 'insights without finished text' do
    where(:state, :answer, :exposed) do
      [
        ['succeeded', nil, false], # never answered
        ['in_progress', '', false], # a run has just started
        ['in_progress', 'They want', false], # the answer is streaming in
        ['failed', 'They want fewer spaces.', true], # the earlier answer was put back
        ['queued', 'They want fewer spaces.', true] # a new run hasn't started yet
      ]
    end

    with_them do
      it 'exposes only a finished answer' do
        question = create(
          :analysis_question,
          background_task: task(:q_and_a_task, state),
          answer: answer,
          insight_attributes: { analysis: analysis, filters: {} }
        )

        expect(described_class.exists?(question.insight.id)).to eq exposed
      end
    end
  end

  it 'gives the project of an analysis that covers a single phase' do
    phase_analysis = create(:survey_analysis)
    summary = create(
      :summary,
      background_task: task(:summarization_task),
      insight_attributes: { analysis: phase_analysis, filters: {} }
    )
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
