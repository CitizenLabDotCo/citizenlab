# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::ProjectContext do
  let(:project) do
    create(:project, title_multiloc: { 'en' => 'Renew the West Park' }, description_preview_multiloc: {})
  end
  let!(:first_phase) do
    create(:phase, project: project, title_multiloc: { 'en' => 'Collect ideas' },
      start_at: '2026-01-01', end_at: '2026-02-01')
  end
  let!(:second_phase) do
    create(:phase, project: project, title_multiloc: { 'en' => 'Vote' },
      start_at: '2026-02-02', end_at: '2026-03-01')
  end

  it 'lists every phase in order with its method and dates' do
    text = described_class.new(project, locale: 'en').to_prompt_text

    expect(text).to include 'Renew the West Park'
    expect(text).to match(/Collect ideas.*\n.*Vote/)
    expect(text).to include '2026-01-01 to 2026-02-01'
  end

  it 'spans the project period across its phases' do
    expect(described_class.new(project, locale: 'en').to_prompt_text)
      .to include 'Project period: 2026-01-01 to 2026-03-01'
  end

  it 'reports the project as a whole when no phase is given' do
    text = described_class.new(project, locale: 'en').to_prompt_text

    expect(text).to include 'covers the whole project'
    expect(text).not_to include 'the phase this report is about'
  end

  it 'marks the reported phase when one is given' do
    text = described_class.new(project, locale: 'en', phase: second_phase).to_prompt_text

    expect(text).to include 'Reported phase: Vote'
    expect(text).to match(/Vote.*<- the phase this report is about/)
  end

  it 'says so plainly when there is no description to write from' do
    expect(described_class.new(project, locale: 'en').to_prompt_text)
      .to include 'Project description (verbatim from the platform, may be empty):
(none)'
  end

  it 'takes the description from the project page builder, as plain text' do
    allow_any_instance_of(ContentBuilder::BuildableDescriptionService)
      .to receive(:description_multiloc).and_return({ 'en' => '<p>A <b>park</b> for everyone.</p>' })

    expect(described_class.new(project, locale: 'en').to_prompt_text)
      .to include 'A park for everyone.'
  end

  describe 'the ids a chart may point at' do
    it 'gives the project and every phase id, so a chart can be bound to them' do
      text = described_class.new(project, locale: 'en').to_prompt_text

      expect(text).to include "projectId: #{project.id}"
      expect(text).to include "phaseId: #{first_phase.id}"
      expect(described_class.new(project, locale: 'en').allowed_ids)
        .to include('projectId' => [project.id], 'phaseId' => contain_exactly(first_phase.id, second_phase.id))
    end

    it 'offers the survey questions of a survey phase, with the phase they belong to' do
      survey_phase = create(:native_survey_phase, project: project)
      form = create(:custom_form, participation_context: survey_phase)
      question = create(:custom_field_select, resource: form, title_multiloc: { 'en' => 'Which park?' })

      context = described_class.new(project, locale: 'en')

      expect(context.allowed_ids['questionId']).to eq [question.id]
      expect(context.to_prompt_text).to include "questionId: #{question.id}, phaseId: #{survey_phase.id}"
      expect(context).to be_survey_questions
    end

    it 'says there is nothing to chart when the project has no survey questions' do
      context = described_class.new(project, locale: 'en')

      expect(context).not_to be_survey_questions
      expect(context.allowed_ids['questionId']).to be_empty
      expect(context.to_prompt_text).to include 'leave the survey widget out'
    end

    it 'offers registration fields the demographics chart can actually draw' do
      field = create(:custom_field_gender, :with_options)

      context = described_class.new(project, locale: 'en')

      expect(context.allowed_ids['customFieldId']).to include field.id
      expect(context).to be_demographic_fields
    end

    it 'knows whether any phase has ideas to rank' do
      expect(described_class.new(project, locale: 'en')).to be_ideation_phase

      survey_only = create(:project)
      create(:native_survey_phase, project: survey_only)

      expect(described_class.new(survey_only, locale: 'en')).not_to be_ideation_phase
    end
  end

  it 'falls back to another locale rather than leaving the project unnamed' do
    project.update!(title_multiloc: { 'nl-BE' => 'Vernieuw het Westpark' })

    expect(described_class.new(project, locale: 'en').to_prompt_text)
      .to include 'Vernieuw het Westpark'
  end
end
