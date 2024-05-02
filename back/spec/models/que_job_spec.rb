# frozen_string_literal: true

require 'rails_helper'

RSpec.describe QueJob, :active_job_que_adapter do
  describe '.find' do
    it 'retrieves the jobs by job_id (uuid) instead of the sequential id (primary key)' do
      job = TestJob.perform_later
      que_job = described_class.by_job_id!(job.job_id)
      expect(que_job.args['job_id']).to eq(job.job_id)
    end
  end

  describe '.by_ids' do
    it 'retrieves the jobs by job_ids' do
      jobs = Array.new(2) { TestJob.perform_later }
      que_jobs = described_class.all_by_job_ids(jobs.map(&:job_id) + ['non-existent-job-id'])
      job_ids_in_db = que_jobs.map { |qj| qj.args['job_id'] }
      expect(job_ids_in_db).to eq(jobs.map(&:job_id))
    end
  end

  describe '#active?' do
    let!(:que_job) do
      id = TestJob.perform_later.job_id
      described_class.by_job_id!(id)
    end

    context 'when the job is not finished and not expired' do
      it 'returns true' do
        expect(que_job.active?).to be true
      end
    end

    context 'when the job is failed' do
      before { que_job.update!(error_count: 1) }

      it 'returns false' do
        expect(que_job.active?).to be false
      end
    end
  end

  describe '#failed?' do
    let!(:que_job) do
      id = TestJob.perform_later.job_id
      described_class.by_job_id!(id)
    end

    context 'when the job is not finished and not expired' do
      it 'returns false' do
        expect(que_job.failed?).to be false
      end
    end

    context 'when the job is failed' do
      before { que_job.update!(error_count: 1) }

      it 'returns true' do
        expect(que_job.failed?).to be true
      end
    end
  end

  describe '#status' do
    let!(:que_job) do
      id = TestJob.perform_later.job_id
      described_class.by_job_id!(id)
    end

    context 'when the job is finished' do
      it 'returns :finished' do
        que_job.update!(finished_at: Time.current)
        expect(que_job.status).to eq(:finished)
      end
    end

    context 'when the job is expired' do
      it 'returns :expired' do
        que_job.update!(expired_at: Time.current)
        expect(que_job.status).to eq(:expired)
      end
    end

    context 'when the job is errored' do
      it 'returns :errored' do
        que_job.update!(error_count: 1)
        expect(que_job.status).to eq(:errored)
      end
    end

    context 'when the job is scheduled' do
      it 'returns :scheduled' do
        que_job.update!(run_at: 1.year.from_now)
        expect(que_job.status).to eq(:scheduled)
      end
    end

    context 'when the job is pending' do
      it 'returns :pending' do
        que_job.update!(run_at: 1.second.ago)
        expect(que_job.status).to eq(:pending)
      end
    end
  end
end
