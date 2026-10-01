# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaCustomFields::SurveyGenerationJob, :active_job_que_adapter do
  let(:job) do
    described_class
      .with_tracking(owner: user)
      .perform_later(phase, user, 'A survey about the park', [], 'en')
  end

  let(:user) { create(:admin) }
  let(:phase) { create(:native_survey_phase, project: create(:project, :draft)) }
  let(:generator) { instance_double(IdeaCustomFields::SurveyGenerator) }
  let(:generated_fields) do
    [
      { input_type: 'page', page_layout: 'default', title_multiloc: { 'en' => 'Your park' }, description_multiloc: {} },
      { input_type: 'text', title_multiloc: { 'en' => 'What do you like?' }, description_multiloc: {}, required: false },
      { input_type: 'page', key: 'form_end', page_layout: 'default', title_multiloc: { 'en' => 'Thanks!' }, include_in_printed_form: false }
    ]
  end

  before do
    allow(IdeaCustomFields::SurveyGenerator).to receive(:new).with(phase, 'en').and_return(generator)
    allow(generator).to receive(:generate).with(prompt: 'A survey about the park', files: []).and_return(generated_fields)
  end

  describe '#perform_later with tracking' do
    it 'creates a tracker on the phase' do
      expect(job.tracker).to have_attributes(
        root_job_type: 'IdeaCustomFields::SurveyGenerationJob',
        context: phase,
        project_id: phase.project_id,
        owner_id: user.id,
        total: 1,
        progress: 0
      )
    end
  end

  describe '#perform' do
    it 'replaces the survey fields and completes the tracker' do
      job.perform_now

      fields = phase.reload.custom_form.custom_fields.order(:ordering)
      expect(fields.map(&:input_type)).to eq(%w[page text page])
      expect(fields.second.title_multiloc).to eq({ 'en' => 'What do you like?' })
      expect(fields.last).to be_form_end_page
      expect(job.tracker.reload).to have_attributes(progress: 1, error_count: 0)
      expect(job.tracker).to be_completed
    end

    it 'completes the tracker with an error when the survey cannot be saved' do
      phase.project.admin_publication.update!(publication_status: 'published')
      expect(ErrorReporter).to receive(:report_msg)

      job.perform_now

      expect(phase.reload.custom_form).to be_nil
      expect(job.tracker.reload).to have_attributes(progress: 1, error_count: 1)
      expect(job.tracker).to be_completed
    end

    it 'completes the tracker with an error when the LLM output is unusable' do
      allow(generator).to receive(:generate).and_raise(IdeaCustomFields::SurveyGenerator::InvalidOutputError)
      expect(ErrorReporter).to receive(:report)

      job.perform_now

      expect(job.tracker.reload).to have_attributes(progress: 1, error_count: 1)
      expect(job.tracker).to be_completed
    end
  end

  describe '#handle_error' do
    it 'retries when the LLM provider is temporarily unavailable' do
      allow(job).to receive(:error_count).and_return(1)
      expect(job).not_to receive(:expire)

      job.handle_error(RubyLLM::OverloadedError.new(nil, 'Overloaded'))
    end

    it 'expires once the retries are used up' do
      allow(job).to receive(:error_count).and_return(3)
      expect(job).to receive(:expire)

      job.handle_error(RubyLLM::OverloadedError.new(nil, 'Overloaded'))
    end

    it 'expires right away on other errors' do
      allow(job).to receive(:error_count).and_return(1)
      expect(job).to receive(:expire)

      job.handle_error(StandardError.new)
    end
  end

  describe '#expire' do
    it 'completes the tracker with an error so polling stops' do
      job.send(:expire)

      expect(job.tracker).to have_attributes(error_count: 1)
      expect(job.tracker).to be_completed
    end
  end
end
