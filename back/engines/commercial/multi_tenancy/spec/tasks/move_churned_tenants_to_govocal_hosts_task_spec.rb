# frozen_string_literal: true

require 'rails_helper'

describe 'churned_tenants:move_to_govocal_hosts rake task' do
  let(:task) { Rake::Task['churned_tenants:move_to_govocal_hosts'] }

  let!(:churned_tenant) { create(:tenant, host: 'participate.mycity.gov.uk', lifecycle: 'churned', creation_finalized_at: Time.zone.now) }
  let!(:active_tenant) { create(:tenant, host: 'engage.othercity.be', lifecycle: 'active', creation_finalized_at: Time.zone.now) }

  before do
    load_rake_tasks_if_not_loaded
    task.reenable
    allow_any_instance_of(MultiTenancy::ChurnedTenantService).to receive(:host_resolves?).and_return(false)
  end

  after { FileUtils.rm_f(%w[move_to_govocal_hosts.json move_to_govocal_hosts_dry_run.json]) }

  it 'renames nothing in a dry run' do
    expect { task.invoke }.to output(/participate\.mycity\.gov\.uk -> participate-mycity\.govocal\.com/).to_stdout
    expect(churned_tenant.reload.host).to eq 'participate.mycity.gov.uk'
  end

  it 'renames churned tenants only, logging the host change' do
    expect { task.invoke('execute') }
      .to output.to_stdout
      .and enqueue_job(LogActivityJob).with(churned_tenant, 'changed_host', anything, anything, payload: { changes: ['participate.mycity.gov.uk', 'participate-mycity.govocal.com'] })

    expect(churned_tenant.reload.host).to eq 'participate-mycity.govocal.com'
    expect(active_tenant.reload.host).to eq 'engage.othercity.be'
  end

  it 'skips a tenant whose new host is already taken' do
    create(:tenant, host: 'participate-mycity.govocal.com')

    expect { task.invoke('execute') }.to output(/already taken/).to_stdout
    expect(churned_tenant.reload.host).to eq 'participate.mycity.gov.uk'
  end

  it 'skips a tenant whose new host already resolves in DNS' do
    allow_any_instance_of(MultiTenancy::ChurnedTenantService).to receive(:host_resolves?).and_return(true)

    expect { task.invoke('execute') }.to output(/already resolves/).to_stdout
    expect(churned_tenant.reload.host).to eq 'participate.mycity.gov.uk'
  end
end
