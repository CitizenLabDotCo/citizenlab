# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::TenantService do
  subject(:service) { described_class.new(tenant_side_fx: tenant_side_fx) }

  let(:tenant_side_fx) { MultiTenancy::SideFxTenantService.new }

  describe '#delete' do
    let(:tenant) { Tenant.current }

    it "enqueues DeleteUserJob's, Tenant::DeleteJob and changed_host job" do
      nb_users = 3
      create_list(:user, nb_users)

      expect { service.delete(tenant) }
        .to  have_enqueued_job(DeleteUserJob).exactly(nb_users).times
        .and have_enqueued_job(MultiTenancy::Tenants::DeleteJob)
        .and have_enqueued_job(LogActivityJob).with(tenant, 'changed_host', any_args)
    end
    # We expect this, since we update tenant host before deleting it.

    it 'runs after_update side effects' do
      expect(tenant_side_fx).to receive(:after_update).with(tenant)
      service.delete(tenant)
    end

    it 'runs before_destroy side effects' do
      expect(tenant_side_fx).to receive(:before_destroy).with(tenant)
      service.delete(tenant)
    end

    it 'marks the tenant as deleted' do
      service.delete(tenant)
      expect(tenant.deleted_at).not_to be_nil
    end
  end
end
