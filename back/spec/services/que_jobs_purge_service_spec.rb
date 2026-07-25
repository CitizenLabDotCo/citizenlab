# frozen_string_literal: true

require 'rails_helper'

RSpec.describe QueJobsPurgeService do
  subject(:service) { described_class.new }

  let(:phase) { create(:phase) }
  let(:gid) { phase.to_global_id.to_s }

  def create_job(job_class: 'ActionMailer::MailDeliveryJob', gids: [gid], **attrs)
    create(:que_job, active_job_class: job_class, related_gids: gids, **attrs)
  end

  describe '#purge_related_to' do
    it 'deletes runnable allowlisted jobs referencing the record' do
      mail_job = create_job
      transition_job = create_job(job_class: 'ProcessScheduledPublicationTransitionsJob')

      service.purge_related_to(phase)

      expect(QueJob.where(id: [mail_job.id, transition_job.id])).to be_empty
    end

    it 'deletes errored jobs awaiting a retry' do
      errored_job = create_job(error_count: 3, run_at: 1.day.from_now)

      expect { service.purge_related_to(phase) }
        .to change { QueJob.exists?(errored_job.id) }.to(false)
    end

    it 'keeps jobs of classes outside the allowlist' do
      other_job = create_job(job_class: 'LogActivityJob')

      service.purge_related_to(phase)

      expect(QueJob.exists?(other_job.id)).to be true
    end

    it 'keeps finished and expired jobs' do
      finished_job = create_job(finished_at: Time.zone.now)
      expired_job = create_job(expired_at: Time.zone.now)

      service.purge_related_to(phase)

      expect(QueJob.where(id: [finished_job.id, expired_job.id]).count).to eq 2
    end

    it 'keeps jobs referencing other records' do
      other_phase = create(:phase)
      other_job = create_job(gids: [other_phase.to_global_id.to_s])

      service.purge_related_to(phase)

      expect(QueJob.exists?(other_job.id)).to be true
    end
  end
end
