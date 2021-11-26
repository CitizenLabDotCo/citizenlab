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
        expect_any_instance_of(MultiTenancy::SideFxTenantService)
          .to receive(:after_destroy).with(tenant)
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
        expect { described_class.perform_now(tenant, last_user_count: 2, wait: 10.minutes) }
          .to enqueue_job(described_class).with(tenant, last_user_count: 1, wait: 10.minutes)
      end
    end
  end
end
