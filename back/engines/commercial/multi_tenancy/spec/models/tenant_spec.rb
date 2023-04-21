# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tenant do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:tenant)).to be_valid
    end
  end

  describe '#switch!' do
    it 'switches successfully into the tenant' do
      tenant = create(:tenant, host: 'unused.hostname.com')
      tenant.switch!
      expect(described_class.current).to eq(tenant)
    end

    it 'fails when the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect { tenant.switch! }.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe '#switch' do
    it 'runs the block in the tenant context' do
      tenant = create(:tenant, host: 'unused.hostname.com')
      current_tenant = tenant.switch { described_class.current }
      expect(current_tenant).to eq(tenant)
    end

    it 'fails if the tenant is not persisted' do
      tenant = build(:tenant, host: 'unused.hostname.com')
      expect do
        tenant.switch { User.first }
      end.to raise_error(Apartment::TenantNotFound)
    end
  end

  describe '#current' do
    it 'works for tenants marked as deleted' do
      described_class.current.update(deleted_at: Time.zone.now)
      expect { described_class.current }.not_to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'deleted scope' do
    it 'returns deleted tenants' do
      expect { described_class.current.update(deleted_at: Time.zone.now) }
        .to change { described_class.deleted.count }.by(1)
    end
  end

  describe 'not_deleted scope' do
    it 'returns tenants that are not marked as deleted' do
      expect { described_class.current.update(deleted_at: Time.zone.now) }
        .to change { described_class.not_deleted.count }.by(-1)
    end
  end

  describe 'with_lifecycle scope' do
    before_all do
      create(:tenant, lifecycle: 'active') # 2 active tenants with the test-tenant
      create(:tenant, lifecycle: 'churned')
    end

    specify { expect(described_class.with_lifecycle('active').count).to eq(2) }
    specify { expect(described_class.churned.count).to eq(1) }
  end

  describe 'Apartment tenant' do
    it 'is created on create' do
      host = 'something-else.com' # a different host than the default test tenant
      tenant = create(:tenant, host: host)
      expect { Apartment::Tenant.switch!(tenant.schema_name) }.not_to raise_error(Apartment::TenantNotFound)
    end

    it 'is deleted on destroy' do
      t = create(:tenant, host: 'something.else-than-the-default-test-tenant')
      expect(Apartment::Tenant).to receive(:drop).with(t.host.tr('.', '_'))
      t.destroy
    end

    it 'fails on a duplicate hostname' do
      create(:tenant)
      expect(build(:tenant, host: described_class.current.host)).to be_invalid
    end
  end

  describe 'Getting the current tenant' do
    it 'succeeds with the correct tenant' do
      tenant = described_class.find_by(host: 'example.org')
      expect(described_class.current).to match(tenant)
    end
  end

  context 'when updated' do
    it 'persists & synchronizes only the dirty attributes' do
      tenant = described_class.current
      another_tenant_ref = described_class.find(tenant.id)

      # The +created_at+ attribute is modified through the other reference.
      new_created_at = another_tenant_ref.created_at + 1
      another_tenant_ref.update!(created_at: new_created_at)

      # The value of the +created_at+ attribute of +app_config+ is now stale, but it's
      # not dirty and as such the update should not persist it.
      tenant.update!(updated_at: Time.zone.now)
      tenant.reload

      expect(tenant.created_at).to eq(new_created_at)
      expect(AppConfiguration.instance.reload.created_at).to eq(new_created_at)
    end
  end
end
