# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass, RSpec/VerifiedDoubles
describe 'single_use:backfill_intercom_company_attributes rake task' do
  let(:companies_api) { double('companies_api') }
  let(:intercom_client) { double('intercom_client', companies: companies_api).as_null_object }
  let(:task) { Rake::Task['single_use:backfill_intercom_company_attributes'] }

  before do
    load_rake_tasks_if_not_loaded
    stub_const('INTERCOM_CLIENT', intercom_client)
    SettingsService.new.activate_feature!('intercom')
    # The task sleeps between tenants for rate limiting; suppress in tests.
    allow_any_instance_of(Object).to receive(:sleep)
  end

  after { task.reenable }

  # Build a company's current custom_attributes hash from what the service
  # would write — keeps the test in sync with TrackIntercomService and the
  # MultiTenancy patch.
  def populated_attrs_for(tenant)
    TrackIntercomService.new.tenant_attributes(tenant).transform_keys(&:to_s)
  end

  describe 'dry run' do
    it 'looks up the company but makes no writes' do
      tenant = Tenant.current
      company = double('company', custom_attributes: {})

      expect(companies_api).to receive(:find).with(company_id: tenant.id).and_return(company)
      expect(companies_api).not_to receive(:save)
      expect(companies_api).not_to receive(:create)

      task.invoke
    end

    it 'reports a would-create when no Intercom company exists' do
      expect(companies_api).to receive(:find).and_raise(Intercom::ResourceNotFound.new('not found'))
      expect(companies_api).not_to receive(:create)

      task.invoke
    end
  end

  describe 'execute mode' do
    it 'updates an existing Intercom company whose CDAs are missing' do
      tenant = Tenant.current
      company = double('company', custom_attributes: {}).as_null_object

      # find runs twice: once for the pre-check, once inside identify_tenant.
      expect(companies_api).to receive(:find).twice.with(company_id: tenant.id).and_return(company)
      expect(company).to receive(:custom_attributes=).with(hash_including(
        tenantId: tenant.id,
        tenantHost: tenant.host
      ))
      expect(companies_api).to receive(:save).with(company)

      task.invoke('execute')
    end

    it 'skips companies whose CDAs are already fully populated (no save, no second find)' do
      tenant = Tenant.current
      company = double('company', custom_attributes: populated_attrs_for(tenant))

      # Only the pre-check find runs; we skip identify_tenant entirely.
      expect(companies_api).to receive(:find).once.with(company_id: tenant.id).and_return(company)
      expect(companies_api).not_to receive(:save)
      expect(companies_api).not_to receive(:create)

      task.invoke('execute')
    end

    it 'still updates when CDAs are partially populated (e.g. missing a new key)' do
      tenant = Tenant.current
      stale = populated_attrs_for(tenant)
      stale.delete('tenantLifecycleStage')
      company = double('company', custom_attributes: stale).as_null_object

      expect(companies_api).to receive(:find).twice.with(company_id: tenant.id).and_return(company)
      expect(company).to receive(:custom_attributes=).with(hash_including(tenantLifecycleStage: 'active'))
      expect(companies_api).to receive(:save).with(company)

      task.invoke('execute')
    end

    it 'creates a new company when none exists' do
      tenant = Tenant.current

      expect(companies_api).to receive(:find).twice.and_raise(Intercom::ResourceNotFound.new('not found'))
      expect(companies_api).to receive(:create).with(hash_including(
        company_id: tenant.id,
        custom_attributes: hash_including(tenantId: tenant.id, tenantHost: tenant.host)
      ))

      task.invoke('execute')
    end
  end

  describe 'tenant filtering' do
    it 'does nothing when intercom feature is not activated on the tenant' do
      SettingsService.new.deactivate_feature!('intercom')

      expect(companies_api).not_to receive(:find)
      expect(companies_api).not_to receive(:create)
      expect(companies_api).not_to receive(:save)

      task.invoke('execute')
    end

    it 'only processes the requested tenant when tenant_host arg is given' do
      tenant = Tenant.current

      expect(companies_api).to receive(:find).at_least(:once).with(company_id: tenant.id)
        .and_return(double('company', custom_attributes: populated_attrs_for(tenant)))

      task.invoke('execute', tenant.host)
    end

    it 'skips when tenant_host arg does not match' do
      expect(companies_api).not_to receive(:find)

      task.invoke('execute', 'nonexistent.example.com')
    end
  end

  describe 'error handling' do
    it 'continues processing remaining tenants when one tenant errors' do
      allow(companies_api).to receive(:find).and_raise(StandardError, 'simulated Intercom failure')

      expect { task.invoke('execute') }.not_to raise_error
    end
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/VerifiedDoubles
