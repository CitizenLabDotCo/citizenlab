# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::ChurnedTenantService do
  subject(:service) { described_class.new(params) }

  let(:params) { {} }

  let_it_be(:churned_tenant) { create(:tenant, lifecycle: 'churned') }

  def create_lifecycle_activity(tenant, lifecycle)
    Activity.create(
      item: tenant,
      action: 'changed_lifecycle_stage',
      payload: { 'changes' => ['active', lifecycle] },
      acted_at: Time.zone.now
    ).reload
    # Reloading to get the exact value of `acted_at` as stored in the DB
    # (lower precision).
  end

  describe '#pii_retention_period' do
    context 'when no value is given to the constructor' do
      it 'takes its value from the environment' do
        stub_const('ENV', ENV.to_h.merge('CHURNED_TENANT_PII_RETENTION_PERIOD' => 5))
        expect(service.pii_retention_period).to eq(5)
      end

      it "is 'nil' if missing from the environment" do
        stub_const('ENV', ENV.to_h.except('CHURNED_TENANT_PII_RETENTION_PERIOD'))
        expect(service.pii_retention_period).to be_nil
      end
    end

    context 'when a value is given to the constructor' do
      let(:params) { { pii_retention_period: 7 } }

      specify { expect(service.pii_retention_period).to eq(params[:pii_retention_period]) }
    end
  end

  describe '#remove_expired_pii' do
    let(:params) { { pii_retention_period: 2 } }
    let!(:churning_activity) do
      churned_tenant.switch do
        create_lifecycle_activity(churned_tenant, 'churned')
      end
    end

    before_all { churned_tenant.switch { create_list(:user, 2) } }

    context 'when PII retention period is not over' do
      it "doesn't enqueue `DeleteUserJob` for churned tenants" do
        expect { service.remove_expired_pii }.not_to enqueue_job(DeleteUserJob)
      end
    end

    context 'when PII retention period is over' do
      before do
        churned_tenant.switch do
          churning_activity.update(acted_at: Time.zone.today - 3.days)
        end
      end

      it 'enqueues `DeleteUserJob` for churned tenants' do
        user_count = churned_tenant.switch { User.count }
        expect { service.remove_expired_pii }.to enqueue_job(DeleteUserJob).exactly(user_count).times
      end
    end
  end

  describe '#churn_date' do
    context 'when the churning activity is missing' do
      before do
        churned_tenant.switch do
          # There is an activity but not the right lifecycle transition.
          create_lifecycle_activity(churned_tenant, 'trial')
        end
      end

      specify do
        expect { service.churn_datetime(churned_tenant) }
          .to raise_error(described_class::UnknownChurnDatetime)
      end
    end

    context 'when the churning activity is stored in the public schema' do
      let!(:churning_activity) do
        Apartment::Tenant.switch('public') do
          create_lifecycle_activity(churned_tenant, 'churned')
        end
      end

      it { expect(service.churn_datetime(churned_tenant)).to eq(churning_activity.acted_at) }
    end

    context 'when the churning activity is stored in the tenant schema' do
      let!(:churning_activity) do
        churned_tenant.switch do
          create_lifecycle_activity(churned_tenant, 'churned')
        end
      end

      it { expect(service.churn_datetime(churned_tenant)).to eq(churning_activity.acted_at) }
    end
  end

  describe '#pii_expired?' do
    using RSpec::Parameterized::TableSyntax

    let(:params) { { pii_retention_period: 5 } }

    where(:churn_datetime, :expired) do
      Time.zone.today | false
      (Time.zone.today - 5.days) | false
      (Time.zone.today - 6.days) | true
    end

    with_them do
      specify do
        expect(service.send(:pii_expired?, churn_datetime)).to eq(expired)
      end
    end
  end
end
