# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteQueJobJob, :active_job_que_adapter do
  subject(:job) { described_class.new }

  describe '#perform' do
    context 'when the job exists' do
      let!(:job_id) { TestJob.set(wait: 1.hour).perform_later('test').job_id }

      it 'deletes the job' do
        expect { job.perform(job_id) }.to change(QueJob, :count).by(-1)
        expect { QueJob.by_job_id!(job_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when the job does not exist' do
      it 'does not raise an error' do
        expect { job.perform('nonexistent-job-id') }.not_to raise_error
      end
    end
  end
end
