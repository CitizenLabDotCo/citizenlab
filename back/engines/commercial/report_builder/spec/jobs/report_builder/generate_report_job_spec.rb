# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::GenerateReportJob do
  subject(:enqueue_job) do
    described_class.with_tracking(owner: owner).perform_later(report, locale: 'en')
  end

  let(:owner) { create(:admin) }
  let(:phase) { create(:phase) }
  let(:report) { create(:report, phase: phase) }
  let(:composed_layout) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => ['textnode01'],
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      'textnode01' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<h2>The project</h2>' } },
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      }
    }
  end

  describe '#perform_later with tracking', :active_job_que_adapter do
    it 'creates a tracker on the phase of the report' do
      job = nil
      expect { job = enqueue_job }
        .to change(QueJob, :count).by(1)
        .and change(Jobs::Tracker, :count).by(1)

      expect(job.tracker).to have_attributes(
        root_job_type: 'ReportBuilder::GenerateReportJob',
        context: phase,
        project_id: phase.project_id,
        owner_id: owner.id,
        total: 1,
        progress: 0
      )
    end
  end

  describe '#run', :active_job_que_adapter do
    before do
      allow_any_instance_of(ReportBuilder::Composition::ReportComposer)
        .to receive(:compose).and_return(composed_layout)
    end

    it 'writes the composed layout to the report and completes' do
      job = enqueue_job

      job.perform_now

      expect(report.reload.layout.craftjs_json).to eq composed_layout
      expect(job.tracker.reload).to have_attributes(progress: 1, total: 1)
      expect(job.tracker).to be_completed
    end

    it 'composes for the project behind the phase, naming the phase it reports on' do
      expect(ReportBuilder::Composition::ReportComposer)
        .to receive(:new).with(phase.project, locale: 'en', phase: phase, author: owner).and_call_original

      enqueue_job.perform_now
    end

    context 'when the report is about a whole project' do
      let(:report) { create(:report, project: phase.project) }

      it 'tracks against the project and composes without a phase' do
        expect(ReportBuilder::Composition::ReportComposer)
          .to receive(:new).with(phase.project, locale: 'en', phase: nil, author: owner).and_call_original

        job = enqueue_job
        expect(job.tracker).to have_attributes(context: phase.project, project_id: phase.project_id)

        job.perform_now
        expect(report.reload.layout.craftjs_json).to eq composed_layout
      end
    end

    it 'starts over from the first attempt\'s progress on a retry' do
      job = enqueue_job
      job.tracker.increment_progress(1)

      job.perform_now

      expect(job.tracker.reload).to have_attributes(progress: 1, total: 1)
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
    it 'completes the tracker so polling stops and a new run can start' do
      job = enqueue_job
      job.send(:expire)
      expect(job.tracker).to be_completed
    end
  end
end
