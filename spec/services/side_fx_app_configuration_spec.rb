# frozen_string_literal: true

require 'rails_helper'

describe 'SideFxAppConfigurationService' do
  let(:service) { SideFxAppConfigurationService.new }
  let(:current_user) { create(:user) }
  let(:tenant) { Tenant.current }
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
        .and have_enqueued_job(LogActivityJob).with(tenant, 'changed', current_user, config.updated_at.to_i, {}) # TODO_MT to be removed
    end

    it "logs a 'changed_lifecycle_stage' action job when the lifecycle has changed" do
      settings = config.settings
      old_lifecycle_stage = settings.dig('core', 'lifecycle_stage')
      settings['core']['lifecycle_stage'] = 'churned'
      config.update!(settings: settings)
      options = { payload: { changes: [old_lifecycle_stage, 'churned'] } }

      updated_at = config.updated_at.to_i
      expect { service.after_update(config, current_user) }
        .to  have_enqueued_job(LogActivityJob).with(config, 'changed_lifecycle_stage', current_user, updated_at, options)
        .and have_enqueued_job(LogActivityJob).with(tenant, 'changed_lifecycle_stage', current_user, updated_at, options) # TODO_MT to be removed
    end
  end
end
