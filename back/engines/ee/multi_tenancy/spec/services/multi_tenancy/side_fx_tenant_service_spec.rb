# frozen_string_literal: true

require 'rails_helper'

describe MultiTenancy::SideFxTenantService do
  let(:service) { described_class.new }
  let(:current_user) { create(:user) }

  describe 'after_create' do
    it "logs a 'created' action" do
      tenant = Tenant.current
      expect { service.after_create(tenant, current_user) }.to(
        have_enqueued_job(LogActivityJob).and(have_enqueued_job(Seo::UpdateGoogleHostJob))
      )
    end
  end

  describe 'around_apply_template' do
    it 'logs a created_failed activity if loading of the templates raises an error' do
      tenant = Tenant.current
      expect do
        service.around_apply_template(tenant, 'base') do
          raise RuntimeError
        end
      end.to raise_error(RuntimeError).and(
        have_enqueued_job(LogActivityJob).with(tenant, 'creation_failed', any_args)
      )
    end

    it 'does not log a ceation_failed activity when no error is raised in the block' do
      tenant = Tenant.current
      expect { service.around_apply_template(tenant, 'base') {} }.not_to(
        have_enqueued_job(LogActivityJob).with(tenant, 'creation_failed')
      )
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the tenant has changed" do
      # MT_TODO to refactor
      tenant = Tenant.current
      settings = tenant.settings
      settings['core']['organization_name'] = { 'en' => 'New name' }
      tenant.update!(settings: settings)
      expect { service.after_update(tenant, current_user) }
        .to have_enqueued_job(LogActivityJob).with(tenant, 'changed', current_user, tenant.updated_at.to_i)
    end

    it "logs a 'changed_host' action job when the tenant host has changed" do
      # This case needs a separate tenant, since we change the host, which
      # changes the db schema and makes some calls fail otherwise
      tenant = create(:tenant)
      old_host = tenant.host
      tenant.update!(host: 'some-domain.net')
      expect { service.after_update(tenant, current_user) }
        .to have_enqueued_job(LogActivityJob).with(tenant, 'changed_host', current_user, tenant.updated_at.to_i,
          payload: { changes: [old_host, 'some-domain.net'] })
        .and have_enqueued_job(Seo::UpdateGoogleHostJob)
    end
  end

  describe 'before_destroy' do
    it 'calls the TypeformWebhookManager to clean up' do
      manager = instance_double(Surveys::TypeformWebhookManager)
      allow(Surveys::TypeformWebhookManager).to receive(:new).and_return(manager)
      expect(manager).to receive(:delete_all_webhooks)
      service.before_destroy(Tenant.current, current_user)
    end
  end
end
