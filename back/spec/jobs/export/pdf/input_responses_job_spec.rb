# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Export::Pdf::InputResponsesJob do
  subject(:enqueue_job) do
    described_class
      .with_tracking(owner: owner)
      .perform_later(phase, cover: cover, redacted_field_keys: [], locale: 'en')
  end

  let(:owner) { create(:admin) }
  let(:phase) { create(:native_survey_phase) }
  let(:cover) do
    { include: false, title: '', subtitle: '', date: '', prepared_by: '', notes: '' }
  end

  let!(:inputs) do
    create(:idea_status_proposed)
    create_list(:native_survey_response, 2, project: phase.project, creation_phase: phase)
  end

  describe '#perform_later with tracking', :active_job_que_adapter do
    it 'creates a tracker on the phase with a unit per input plus one for the render' do
      job = nil
      expect { job = enqueue_job }
        .to change(QueJob, :count).by(1)
        .and change(Jobs::Tracker, :count).by(1)

      expect(job.tracker).to have_attributes(
        root_job_type: 'Export::Pdf::InputResponsesJob',
        context: phase,
        project_id: phase.project_id,
        owner_id: owner.id,
        total: 3, # 2 inputs + 1 reserved for the Gotenberg render
        progress: 0
      )
    end
  end

  describe '#perform', :active_job_que_adapter do
    let(:pdf) do
      Tempfile.new(['gotenberg', '.pdf']).tap do |file|
        file.write('%PDF-1.4 fake')
        file.rewind
      end
    end

    before do
      allow_any_instance_of(GotenbergClient).to receive(:render_html_to_pdf).and_return(pdf)
    end

    it 'ticks the tracker, stores the result file and completes' do
      job = enqueue_job

      expect { job.perform_now }.to change(Export::ResultFile, :count).by(1)

      expect(job.tracker.reload).to have_attributes(progress: 3, total: 3)
      expect(job.tracker).to be_completed

      result = Export::ResultFile.sole
      expect(result.tracker).to eq(job.tracker)
      expect(result.name).to eq('input_responses.pdf')
      expect(result.expires_at).to be > Time.current
      expect(result.content.read).to eq('%PDF-1.4 fake')
    end

    it 'starts over from the first attempt\'s progress on a retry' do
      job = enqueue_job
      # A first attempt that collected both inputs before failing in the render.
      job.tracker.increment_progress(2)

      job.perform_now

      # Without the reset this would end at 5/5 (double-counted progress).
      expect(job.tracker.reload).to have_attributes(progress: 3, total: 3)
    end
  end

  describe '#handle_error', :active_job_que_adapter do
    let(:job) { enqueue_job }

    it 'does not expire on the first failure' do
      allow(job).to receive(:error_count).and_return(1)
      expect(job).not_to receive(:expire)
      job.handle_error(StandardError.new)
    end

    it 'expires after the retry also failed' do
      allow(job).to receive(:error_count).and_return(2)
      expect(job).to receive(:expire)
      job.handle_error(StandardError.new)
    end
  end

  describe '#expire', :active_job_que_adapter do
    it 'completes the tracker so polling stops and a new export can start' do
      job = enqueue_job
      job.send(:expire)
      expect(job.tracker).to be_completed
    end
  end
end
