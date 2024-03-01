# frozen_string_literal: true

require 'rails_helper'

RSpec.describe QueJob, :active_job_que_adapter do
  describe '.find' do
    it 'retrieves the jobs by job_id (uuid) instead of the sequential id (primary key)' do
      job = TestJob.perform_later
      que_job = described_class.find(job.job_id)
      expect(que_job.args['job_id']).to eq(job.job_id)
    end
  end

  describe '#status' do
    let!(:que_job) do
      id = TestJob.perform_later.job_id
      described_class.find(id)
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
