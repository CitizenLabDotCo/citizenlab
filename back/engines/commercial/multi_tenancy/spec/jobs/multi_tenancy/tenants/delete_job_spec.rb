# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Tenants::DeleteJob do
  let(:tenant) { Tenant.current }

  def create_job(job_class, arguments = [], schema_name: tenant.schema_name, **attrs)
    create(:que_job, active_job_class: job_class, job_arguments: arguments, tenant_schema_name: schema_name, **attrs)
  end

  describe '#perform_now' do
    context 'when the third-party removals are not queued yet' do
      before_all { create_list(:user, 3) }

      it 'queues them with one job per service per batch of users, and reschedules itself' do
        stub_const("#{described_class}::THIRD_PARTY_REMOVAL_BATCH_SIZE", 2)

        expect { described_class.perform_now(tenant) }
          .to  have_enqueued_job(RemoveUserFromIntercomJob).exactly(2).times
          .and have_enqueued_job(RemoveUsersFromSegmentJob).exactly(2).times
          .and have_enqueued_job(described_class).with(tenant, third_party_removal_queued: true)
      end

      it 'does not delete the users one by one' do
        expect { described_class.perform_now(tenant) }.to not_have_enqueued_job(DeleteUserJob)
      end

      it 'does not destroy the tenant yet' do
        described_class.perform_now(tenant)
        expect(tenant.reload).to be_present
      end

      context 'when the template of the tenant is still loading' do
        let!(:template_job) do
          create_job('MultiTenancy::ApplyTenantTemplateJob', ['base', { _aj_globalid: tenant.to_global_id.to_s }])
        end

        it 'waits until it is loaded' do
          expect { described_class.perform_now(tenant) }
            .to  have_enqueued_job(described_class).with(tenant, third_party_removal_queued: false)
            .and not_have_enqueued_job(RemoveUserFromIntercomJob)
        end

        it 'goes ahead once loading has failed' do
          template_job.update!(expired_at: Time.zone.now)

          expect { described_class.perform_now(tenant) }
            .to have_enqueued_job(described_class).with(tenant, third_party_removal_queued: true)
        end
      end

      it 'is not held up by the template of another tenant' do
        create_job('MultiTenancy::ApplyTenantTemplateJob', ['base', { _aj_globalid: 'gid://cl2-back/Tenant/other' }])

        expect { described_class.perform_now(tenant) }
          .to have_enqueued_job(described_class).with(tenant, third_party_removal_queued: true)
      end

      it 'still runs jobs queued with the former arguments' do
        expect { described_class.perform_now(tenant, last_user_count: 5, retry_interval: 6.hours) }
          .to  have_enqueued_job(RemoveUserFromIntercomJob)
          .and have_enqueued_job(described_class).with(tenant, third_party_removal_queued: true)
      end
    end

    context 'when the third-party removals are queued' do
      it 'waits while they are still running' do
        create_job('Matomo::RemoveUserFromMatomoJob', [['user-id']])

        expect { described_class.perform_now(tenant, third_party_removal_queued: true) }
          .to have_enqueued_job(described_class).with(tenant, third_party_removal_queued: true)
        expect(tenant.reload).to be_present
      end

      it 'reports the users of removal jobs that expired, and still destroys the tenant' do
        create_job(
          'Matomo::RemoveUserFromMatomoJob', [%w[user-1 user-2]],
          expired_at: Time.zone.now, last_error_message: 'Matomo::Client::MatomoApiError: 503'
        )
        create_job('PosthogIntegration::RemoveUserFromPosthogJob', ['user-3'], expired_at: Time.zone.now)
        create_job('RemoveUserFromIntercomJob', [['user-4']], finished_at: Time.zone.now)
        allow(ErrorReporter).to receive(:report_msg)

        described_class.perform_now(tenant, third_party_removal_queued: true)

        expect(ErrorReporter).to have_received(:report_msg).twice
        expect(ErrorReporter).to have_received(:report_msg).with(
          anything,
          extra: {
            tenant_id: tenant.id,
            job_class: 'Matomo::RemoveUserFromMatomoJob',
            user_ids: %w[user-1 user-2],
            last_error_message: 'Matomo::Client::MatomoApiError: 503'
          }
        )
        expect(ErrorReporter).to have_received(:report_msg).with(
          anything, extra: hash_including(job_class: 'PosthogIntegration::RemoveUserFromPosthogJob', user_ids: ['user-3'])
        )
        expect { tenant.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'destroys the tenant once they are done' do
        create(:user)

        described_class.perform_now(tenant, third_party_removal_queued: true)
        expect { tenant.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'runs after_destroy side effects' do
        service = instance_double(MultiTenancy::SideFxTenantService)
        allow(MultiTenancy::SideFxTenantService).to receive(:new).and_return(service)
        expect(service).to receive(:after_destroy).with(tenant)

        described_class.perform_now(tenant, third_party_removal_queued: true)
      end

      context 'when files are stored on S3' do
        let(:s3_utils) { instance_double(Aws::S3::Utils, delete_objects: { deleted_count: 4, errors_count: 0 }) }
        let(:s3_client) { instance_double(Aws::S3::Client) }

        before do
          allow(AvatarUploader).to receive(:use_fog_engine?).and_return(true)
          allow(Aws::S3::Utils).to receive(:new).and_return(s3_utils)
          allow(Aws::S3::Client).to receive(:new).and_return(s3_client)
          allow(ENV).to receive(:fetch).and_call_original
          allow(ENV).to receive(:fetch).with('AWS_S3_BUCKET').and_return('uploads-bucket')
        end

        it 'deletes the avatars of the users' do
          described_class.perform_now(tenant, third_party_removal_queued: true)

          expect(s3_utils).to have_received(:delete_objects)
            .with('uploads-bucket', s3_client, prefix: "uploads/#{tenant.id}/user/avatar/")
        end

        it 'reports avatars that could not be deleted, and still destroys the tenant' do
          allow(s3_utils).to receive(:delete_objects).and_return({ deleted_count: 3, errors_count: 1 })
          allow(ErrorReporter).to receive(:report_msg)

          described_class.perform_now(tenant, third_party_removal_queued: true)

          expect(ErrorReporter).to have_received(:report_msg)
          expect { tenant.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      it 'does not touch S3 when files are stored locally' do
        allow(Aws::S3::Utils).to receive(:new)

        described_class.perform_now(tenant, third_party_removal_queued: true)
        expect(Aws::S3::Utils).not_to have_received(:new)
      end
    end
  end
end
