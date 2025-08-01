# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::DescriptionGenerationJob do
  # Helper method to create a file with AI processing allowed, but without queuing a
  # description generation job.
  def create_ai_file(...)
    # If the `ai_processing_allowed` attribute is set to true at creation time,
    # the uploader will automatically enqueue a description generation job.
    create(:file, ...).tap do |file|
      file.update!(ai_processing_allowed: true)
    end
  end

  describe '#handle_error' do
    let(:job) { described_class.perform_later(create_ai_file) }

    it 'expires the job for unrecoverable errors' do
      expect(job)
        .to receive(:expire)
        .exactly(described_class::UNRECOVERABLE_ERRORS.size).times

      described_class::UNRECOVERABLE_ERRORS.each do |error_class|
        job.send(:handle_error, error_class.new)
      end
    end

    it 'does not expire the job for recoverable errors' do
      expect(job).not_to receive(:expire)
      job.send(:handle_error, StandardError.new)
    end
  end

  describe '#expire', :active_job_que_adapter do
    let(:job) do
      described_class.with_tracking.perform_later(create_ai_file)
    end

    it 'marks the job as complete' do
      job.send(:expire)
      expect(job.tracker).to be_completed
      expect(job.tracker.error_count).to be_positive
    end
  end

  describe '#job_tracking_context', :active_job_que_adapter do
    it 'sets the file as the job context' do
      file = create_ai_file
      job = described_class.with_tracking.perform_later(file)
      expect(job.tracker.context).to eq(file)
    end

    it 'raises an error if the argument is not a Files::File' do
      job = described_class.perform_later('not a file')
      expect { job.send(:job_tracking_context) }
        .to raise_error('Expected file, got String')
    end
  end

  describe '#perform' do
    let(:generator_service) { instance_double(Files::DescriptionGenerator) }

    before do
      allow(Files::DescriptionGenerator).to receive(:new).and_return(generator_service)
      allow(generator_service).to receive(:generate_descriptions!).and_return(true)
    end

    it 'calls the description generator service' do
      job = described_class.new
      expect(job).to receive(:mark_as_complete!)

      file = create_ai_file
      job.perform(file)

      expect(generator_service).to have_received(:generate_descriptions!).with(file)
    end
  end

  describe '#perform_later' do
    context 'with tracking', :active_job_que_adapter do
      it 'creates a tracker with the correct attributes' do
        file = create_ai_file

        job = nil
        expect { job = described_class.with_tracking.perform_later(file) }
          .to change(QueJob, :count).by(1)
          .and change(Jobs::Tracker, :count).by(1)

        expect(job.tracker).to be_present
        expect(job.tracker.root_job_type).to eq('Files::DescriptionGenerationJob')
        expect(job.tracker.context).to eq(file)
        expect(job.tracker.project_id).to be_nil # Files don't have projects by default
      end
    end
  end
end
