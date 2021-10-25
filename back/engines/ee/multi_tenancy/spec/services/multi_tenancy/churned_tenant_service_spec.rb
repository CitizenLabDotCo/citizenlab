# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::ChurnedTenantService do
  subject(:service) { described_class.new(params) }
  let(:params) { {} }

  describe '#pii_retention_period' do
    context 'when no value is given to the constructor' do
      it 'takes its value from the environment' do
        stub_const('ENV', ENV.to_h.merge('CHURNED_TENANT_PII_RETENTION_PERIOD' => 5))
        expect(service.pii_retention_period).to eq(5)
      end

      it "is 'nil' if missing from the environment" do
        stub_const('ENV', ENV.to_h.except('CHURNED_TENANT_PII_RETENTION_PERIOD'))
        expect(service.pii_retention_period).to eq(nil)
      end
    end

    context 'when a value is given to the constructor' do
      let(:params) { { pii_retention_period: 7 } }

      specify { expect(service.pii_retention_period).to eq(params[:pii_retention_period]) }
    end
  end

  describe '#remove_expired_pii' do
    let(:params) { { pii_retention_period: 2 } }
    let(:churned_tenant) { create(:tenant, lifecycle: 'churned') }

    before { churned_tenant.switch { create_list(:user, 2) } }

    it do
      expect { service.remove_expired_pii }.not_to enqueue_job(DeleteUserJob)
    end

    it do
      churned_tenant.updated_at = Date.today - 3.days
      user_count = churned_tenant.switch { User.count }
      expect { service.remove_expired_pii }.to equeue_job(DeleteUserJob).exactly(user_count).times
    end
  end

  describe '#pii_expired?' do
    using RSpec::Parameterized::TableSyntax

    let(:params) { { pii_retention_period: 5 } }

    where(:churn_date, :expired) do
      Date.today | false
      Date.today - 5.days | false
      Date.today - 6.days | true
    end

    with_them do
      specify do
        expect(service.send(:pii_expired?, churn_date)).to eq(expired)
      end
    end
  end
end
