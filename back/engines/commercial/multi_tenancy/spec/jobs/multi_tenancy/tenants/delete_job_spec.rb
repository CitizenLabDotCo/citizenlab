# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Tenants::DeleteJob do
  let(:tenant) { Tenant.current }

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
    end

    context 'when tenant still have users' do
      before_all { create(:user) }

      it 'aborts if the nb of users did not decrease since the last attempt' do
        expect { described_class.perform_now(tenant, last_user_count: 1) }
          .to raise_error(described_class::Aborted)
      end

      it 'schedule a new attempt if the nb of users decreased since the last attempt' do
        expect { described_class.perform_now(tenant, last_user_count: 2, retry_interval: 10.minutes) }
          .to enqueue_job(described_class).with(tenant, last_user_count: 1, retry_interval: 10.minutes)
      end
    end
  end
end
