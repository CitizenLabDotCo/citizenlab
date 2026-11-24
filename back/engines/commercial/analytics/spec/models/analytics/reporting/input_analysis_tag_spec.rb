# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputAnalysisTag do
  it 'exposes a tagging with its tag and analysis' do
    analysis = create(:analysis)
    tag = create(:tag, analysis: analysis, name: 'Cycling', tag_type: 'nlp_topic')
    idea = create(:idea, project: analysis.project)
    tagging = create(:tagging, tag: tag, input: idea)
    row = described_class.find(tagging.id)

    expect(row.input_id).to eq idea.id
    expect(row.analysis_id).to eq analysis.id
    expect(row.project_id).to eq analysis.project_id
    expect(row.phase_id).to be_nil
    expect(row.tag_id).to eq tag.id
    expect(row.tag_label).to eq 'Cycling'
    expect(row.tag_type).to eq 'nlp_topic'
  end

  it 'gives the project of an analysis that covers a single phase' do
    analysis = create(:survey_analysis)
    create(:idea_status_proposed)
    response = create(:native_survey_response, project: analysis.phase.project, creation_phase: analysis.phase)
    tagging = create(:tagging, tag: create(:tag, analysis: analysis), input: response)
    row = described_class.find(tagging.id)

    expect(row.phase_id).to eq analysis.phase_id
    expect(row.project_id).to eq analysis.phase.project_id
  end

  it 'tells auto-tagged inputs from inputs tagged by hand' do
    tag = create(:tag)
    auto = create(:tagging, tag: tag, background_task: create(:auto_tagging_task, analysis: tag.analysis))
    manual = create(:tagging, tag: tag)

    expect(described_class.find(auto.id).auto_tagged).to be true
    expect(described_class.find(manual.id).auto_tagged).to be false
  end

  it 'excludes taggings on draft inputs' do
    tagging = create(:tagging, input: create(:idea, publication_status: 'draft'))

    expect(described_class.where(id: tagging.id)).to be_empty
  end

  it 'documents every tag type' do
    description = described_class.field_descriptions['tag_type']

    expect(Analysis::Tag::TAG_TYPES).to all(satisfy { |tag_type| description.include?("'#{tag_type}'") })
  end

  it 'documents the sentiment tag names' do
    description = described_class.field_descriptions['tag_label']
    names = [Analysis::AutoTaggingMethod::Sentiment::POSITIVE_NAME, Analysis::AutoTaggingMethod::Sentiment::NEGATIVE_NAME]

    expect(names).to all(satisfy { |name| description.include?("'#{name}'") })
  end
end
