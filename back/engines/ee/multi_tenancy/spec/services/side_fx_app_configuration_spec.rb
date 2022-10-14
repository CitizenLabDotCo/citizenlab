# frozen_string_literal: true

require 'rails_helper'

describe 'SideFxAppConfigurationService' do
  # Avoid problems with CI failures, where the host change applied in one of the tests here seems to
  # persist and break subsequent tests (but not locally), by using a separate tenant here and then
  # switching back to the default tenant.
  before do
    Apartment::Tenant.switch!(test_tenant.schema_name) if CitizenLab.ee? # Switch into a test tenant
  end

  after do
    Apartment::Tenant.switch!(current_tenant.schema_name) if CitizenLab.ee? # Switch back to the default tenant
  end

  let(:service) { SideFxAppConfigurationService.new }
  let(:current_user) { create(:user) }
  let(:test_tenant) { create(:tenant) }
  let(:current_tenant) { Tenant.current }
  let(:config) { AppConfiguration.instance }

  it 'has an #before_update method' do
    # only test for the presence of the method bc it does nothing for now.
    service.before_update(AppConfiguration.instance, current_user)
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the configuration has changed" do
      settings = config.settings
      settings['core']['organization_name'] = { 'en' => 'New name' }
      config.update!(settings: settings)

      expect { service.after_update(config, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(config, 'changed', current_user, config.updated_at.to_i, {})
        .and have_enqueued_job(LogActivityJob).with(test_tenant, 'changed', current_user, config.updated_at.to_i, {}) # TODO_MT to be removed
    end

    it "logs a 'changed_lifecycle_stage' action job when the lifecycle has changed" do
      settings = config.settings
      old_lifecycle_stage = settings.dig('core', 'lifecycle_stage')
      settings['core']['lifecycle_stage'] = 'churned'
      config.update!(settings: settings)
      options = { payload: { changes: [old_lifecycle_stage, 'churned'] } }

      updated_at = config.updated_at.to_i
      expect { service.after_update(config, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(config, 'changed_lifecycle_stage', current_user, updated_at,
          options)
        .and have_enqueued_job(LogActivityJob).with(test_tenant, 'changed_lifecycle_stage', current_user, updated_at, options) # TODO_MT to be removed
    end

    it "logs a 'changed_host' action job when the host has changed" do
      old_host = config.host
      new_host = 'seboslovakia.citizenlab.co'
      config.update! host: new_host

      options = { payload: { changes: [old_host, new_host] } }
      updated_at = config.updated_at.to_i
      expect { service.after_update(config, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(config, 'changed_host', current_user, updated_at, options)
        .and have_enqueued_job(LogActivityJob).with(test_tenant, 'changed_host', current_user, updated_at, options)
    end
  end
end
