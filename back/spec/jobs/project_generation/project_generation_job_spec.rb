# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectGeneration::ProjectGenerationJob, :active_job_que_adapter do
  let(:job) do
    described_class
      .with_tracking(owner: user)
      .perform_later(project, user, 'A project about the park', [], 'en', levers)
  end

  let(:user) { create(:admin) }
  let(:project) { create(:project, :draft) }
  let(:levers) { { influence: 1, how_fixed: 1, reach: 1, format: 1, audience: 1 } }
  let(:generator) { instance_double(ProjectGeneration::ProjectGenerator) }

  before do
    allow(ProjectGeneration::ProjectGenerator).to receive(:new).with(project, user, 'en').and_return(generator)
  end

  describe '#perform_later with tracking' do
    it 'creates a tracker on the project' do
      allow(generator).to receive(:generate_and_persist)
        .and_return(ProjectGeneration::ProjectGenerator::GenerationResult.new(errors: [], failed: false))

      expect(job.tracker).to have_attributes(
        root_job_type: 'ProjectGeneration::ProjectGenerationJob',
        context: project,
        owner_id: user.id,
        total: 1,
        progress: 0
      )
    end
  end

  describe '#perform' do
    it 'completes the tracker when the draft is saved' do
      allow(generator).to receive(:generate_and_persist)
        .and_return(ProjectGeneration::ProjectGenerator::GenerationResult.new(errors: [], failed: false))

      job.perform_now

      expect(job.tracker.reload).to have_attributes(progress: 1, error_count: 0)
      expect(job.tracker).to be_completed
    end

    it 'completes the tracker with an error when core persistence fails' do
      allow(generator).to receive(:generate_and_persist)
        .and_return(ProjectGeneration::ProjectGenerator::GenerationResult.new(errors: ['create_phase: boom'], failed: true))
      expect(ErrorReporter).to receive(:report_msg)

      job.perform_now

      expect(job.tracker.reload).to have_attributes(progress: 1, error_count: 1)
      expect(job.tracker).to be_completed
    end

    it 'completes the tracker with an error when the LLM output is unusable' do
      allow(generator).to receive(:generate_and_persist)
        .and_raise(ProjectGeneration::ProjectGenerator::InvalidOutputError)
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
      allow(generator).to receive(:generate_and_persist)
        .and_return(ProjectGeneration::ProjectGenerator::GenerationResult.new(errors: [], failed: false))
      job.send(:expire)

      expect(job.tracker).to have_attributes(error_count: 1)
      expect(job.tracker).to be_completed
    end
  end
end
