# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Tenants::DeleteJob do
  let(:tenant) { Tenant.current }

  def create_job(job_class, arguments = [], schema_name: tenant.schema_name, **attrs)
    create(:que_job, active_job_class: job_class, job_arguments: arguments, tenant_schema_name: schema_name, **attrs)
  end

  describe '#perform_now' do
    context 'when tenant has no users' do
      it 'deletes tenant' do
        described_class.perform_now(tenant)
        expect { tenant.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'runs after_destroy side effects' do
        service = instance_double(MultiTenancy::SideFxTenantService)
        allow(MultiTenancy::SideFxTenantService).to receive(:new).and_return(service)
        expect(service).to receive(:after_destroy).with(tenant)
        described_class.perform_now(tenant)
      end

      it 'waits for the third-party removal jobs before deleting the tenant' do
        create_job('Matomo::RemoveUserFromMatomoJob', [['user-id']])

        expect { described_class.perform_now(tenant, last_user_count: 1) }
          .to have_enqueued_job(described_class).with(tenant, last_user_count: 1)
        expect(tenant.reload).to be_present
      end

      it 'ignores third-party removal jobs that expired' do
        create_job('Matomo::RemoveUserFromMatomoJob', [['user-id']], expired_at: Time.zone.now)

        described_class.perform_now(tenant)
        expect { tenant.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when tenant still has users' do
      before_all { create_list(:user, 3) }

      it 'queues the first batch of user deletions and reschedules itself' do
        stub_const("#{described_class}::BATCH_SIZE", 2)

        expect { described_class.perform_now(tenant) }
          .to  have_enqueued_job(DeleteUserJob).exactly(2).times
          .and have_enqueued_job(described_class).with(tenant, last_user_count: 3)
      end

      it 'removes the batch from third parties with one job per service' do
        expect { described_class.perform_now(tenant) }
          .to  have_enqueued_job(RemoveUserFromIntercomJob).exactly(:once)
          .and have_enqueued_job(RemoveUsersFromSegmentJob).exactly(:once)
      end

      it 'waits while the current batch is still being processed' do
        create_job('DeleteUserJob', [User.first.id])

        expect { described_class.perform_now(tenant, last_user_count: 3) }
          .to  have_enqueued_job(described_class).with(tenant, last_user_count: 3)
          .and not_have_enqueued_job(DeleteUserJob)
      end

      it 'queues the next batch once the user count decreased' do
        expect { described_class.perform_now(tenant, last_user_count: 5) }
          .to  have_enqueued_job(DeleteUserJob).exactly(3).times
          .and have_enqueued_job(described_class).with(tenant, last_user_count: 3)
      end

      it 'aborts if the nb of users did not decrease after the last batch' do
        expect { described_class.perform_now(tenant, last_user_count: 3) }
          .to raise_error(described_class::Aborted)
      end

      it 'still runs jobs queued with the former retry_interval argument' do
        expect { described_class.perform_now(tenant, last_user_count: 5, retry_interval: 6.hours) }
          .to have_enqueued_job(described_class).with(tenant, last_user_count: 3)
      end
    end
  end
end
