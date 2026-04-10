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
      before do
        allow(file_parser).to receive(:parse_rows)
          .and_raise(RubyLLM::RateLimitError.new(nil, 'rate limited'))
      end

      it 'raises the error so Que can retry' do
        job = described_class.new

        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(RubyLLM::RateLimitError)
      end

      it 'calls after_failure before re-raising' do
        sidefx = instance_double(BulkImportIdeas::SideFxBulkImportService)
        allow(BulkImportIdeas::SideFxBulkImportService).to receive(:new).and_return(sidefx)
        allow(sidefx).to receive(:after_failure)

        job = described_class.new
        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(RubyLLM::RateLimitError)

        expect(sidefx).to have_received(:after_failure).with(admin, phase, 'idea', 'pdf', anything)
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
        call_count = 0
        allow(file_parser).to receive(:parse_rows) do
          call_count += 1
          raise RubyLLM::RateLimitError.new(nil, 'rate limited') if call_count == 3

          [{ title_multiloc: { en: 'Test' } }]
        end
        allow(import_service).to receive(:import).and_return([create(:idea, project: project)])

        job = described_class.new
        expect { job.run(files, admin, 'en', phase, false, 1) }
          .to raise_error(RubyLLM::RateLimitError)

        expect(import_service).to have_received(:import).exactly(2).times
      end
    end
  end

  describe '#handle_error' do
    let(:job) { described_class.perform_later(files, admin, 'en', phase, false, 1) }

    context 'with a retryable error and retries remaining' do
      it 'retries without reporting to Sentry' do
        allow(job).to receive_messages(error_count: 1, expire: nil)
        allow(job).to receive(:resolve_que_setting).with(:maximum_retry_count).and_return(max_retry_count)
        allow(job).to receive(:retry_in_default_interval)
        allow(ErrorReporter).to receive(:report)

        job.handle_error(RubyLLM::RateLimitError.new(nil, 'rate limited'))

        expect(job).not_to have_received(:expire)
        expect(ErrorReporter).not_to have_received(:report)
      end
    end

    context 'with a retryable error and retries exhausted' do
      it 'reports to Sentry and expires' do
        allow(job).to receive_messages(error_count: max_retry_count + 1, expire: nil)
        allow(job).to receive(:resolve_que_setting).with(:maximum_retry_count).and_return(max_retry_count)
        allow(ErrorReporter).to receive(:report)

        job.handle_error(RubyLLM::RateLimitError.new(nil, 'rate limited'))

        expect(ErrorReporter).to have_received(:report)
        expect(job).to have_received(:expire)
      end
    end

    context 'with a permanent error' do
      it 'reports to Sentry and expires immediately' do
        allow(job).to receive_messages(error_count: 1, expire: nil)
        allow(job).to receive(:resolve_que_setting).with(:maximum_retry_count).and_return(max_retry_count)
        allow(ErrorReporter).to receive(:report)

        job.handle_error(BulkImportIdeas::Error.new('bulk_import_idea_not_valid', value: 'bad'))

        expect(ErrorReporter).to have_received(:report)
        expect(job).to have_received(:expire)
      end
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
