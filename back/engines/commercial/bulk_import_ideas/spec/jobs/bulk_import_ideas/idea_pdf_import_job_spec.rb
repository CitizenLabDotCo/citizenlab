# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::IdeaPdfImportJob do
  let(:project) { create(:single_phase_ideation_project) }
  let(:phase) { project.phases.first }
  let(:admin) { create(:admin) }
  let(:files) { create_list(:idea_import_file, 3, project: project) }

  let(:file_parser) { instance_double(BulkImportIdeas::Parsers::IdeaPdfFileParser) }
  let(:import_service) { instance_double(BulkImportIdeas::Importers::IdeaImporter, imported_users: []) }
  let(:max_retry_count) { Que::Job.maximum_retry_count }

  before do
    create(:idea_status, code: 'proposed')
    allow(BulkImportIdeas::Parsers::IdeaPdfFileParser).to receive(:new).and_return(file_parser)
    allow(BulkImportIdeas::Importers::IdeaImporter).to receive(:new).and_return(import_service)
  end

  describe '#run' do
    context 'when all files succeed' do
      before do
        allow(file_parser).to receive(:parse_rows).and_return([{ title_multiloc: { en: 'Test' } }])
        allow(import_service).to receive(:import).and_return([create(:idea, project: project)])
      end

      it 'imports all files and tracks progress' do
        job = described_class.new
        tracker = create_tracker(job, files.count)
        allow(job).to receive_messages(tracked?: true, tracker: tracker)

        job.run(files, admin, 'en', phase, false, 1)

        expect(file_parser).to have_received(:parse_rows).exactly(3).times
        expect(import_service).to have_received(:import).exactly(3).times
      end
    end

    context 'when a file has already been imported' do
      it 'skips that file' do
        idea = create(:idea, project: project)
        create(:idea_import, idea: idea, file: files[0])

        allow(file_parser).to receive(:parse_rows).and_return([])
        allow(import_service).to receive(:import).and_return([])

        job = described_class.new
        job.run(files, admin, 'en', phase, false, 1)

        expect(file_parser).to have_received(:parse_rows).exactly(2).times
        expect(file_parser).not_to have_received(:parse_rows).with(files[0])
      end
    end

    context 'when a retryable error occurs' do
      let(:retryable_error_class) { described_class::RETRYABLE_ERRORS.first }

      before do
        allow(file_parser).to receive(:parse_rows)
          .and_raise(retryable_error_class.new(nil, 'retryable'))
      end

      it 'raises the error so Que can retry' do
        job = described_class.new

        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(retryable_error_class)
      end
    end

    context 'when a permanent error occurs' do
      it 'raises the error' do
        allow(file_parser).to receive(:parse_rows)
          .and_raise(BulkImportIdeas::Error.new('bulk_import_idea_not_valid', value: 'bad'))

        job = described_class.new

        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(BulkImportIdeas::Error)
      end
    end

    context 'when some files succeed before a retryable error' do
      it 'imports succeeded files and raises on the failing one' do
        retryable_error_class = described_class::RETRYABLE_ERRORS.first
        call_count = 0
        allow(file_parser).to receive(:parse_rows) do
          call_count += 1
          raise retryable_error_class.new(nil, 'retryable') if call_count == 3

          [{ title_multiloc: { en: 'Test' } }]
        end
        allow(import_service).to receive(:import).and_return([create(:idea, project: project)])

        job = described_class.new
        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(retryable_error_class)

        expect(import_service).to have_received(:import).exactly(2).times
      end
    end
  end

  describe '#handle_error' do
    let(:job) { described_class.perform_later(files, admin, 'en', phase, false, 1) }

    before do
      allow(job).to receive(:maximum_retry_count).and_return(max_retry_count)
    end

    it 'expires the job for permanent errors' do
      expect(job).to receive(:expire)
      job.send(:handle_error, BulkImportIdeas::Error.new('bulk_import_idea_not_valid', value: 'bad'))
    end

    it 'delegates retryable errors to super' do
      allow(job).to receive_messages(error_count: 1)
      allow(job).to receive(:retry_in_default_interval)
      expect(job).not_to receive(:expire)

      described_class::RETRYABLE_ERRORS.each do |error_class|
        job.send(:handle_error, error_class.new(nil, 'retryable'))
      end
    end
  end

  describe '#expire', :active_job_que_adapter do
    let(:job) { described_class.with_tracking.perform_later(files, admin, 'en', phase, false, 1) }
    let(:sidefx) { instance_double(BulkImportIdeas::SideFxBulkImportService, after_failure: nil) }

    before do
      allow(BulkImportIdeas::SideFxBulkImportService).to receive(:new).and_return(sidefx)
      allow(job).to receive(:last_error).and_return('boom')
    end

    it 'calls after_failure and marks the tracker as completed' do
      job.send(:expire)

      expect(sidefx).to have_received(:after_failure).with(admin, phase, 'idea', 'pdf', 'boom')
      expect(job.tracker).to be_completed
    end
  end

  private

  def create_tracker(_job, total)
    Jobs::Tracker.create!(
      root_job_id: 0,
      root_job_type: described_class.name,
      total: total,
      owner: admin,
      context: phase,
      project_id: phase.project_id
    )
  end
end
