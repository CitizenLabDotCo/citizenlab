# frozen_string_literal: true

require 'rails_helper'

describe 'SideFxAppConfigurationService' do
  let(:service) { SideFxAppConfigurationService.new }
  let(:current_user) { create(:user) }
  let(:tenant) { Tenant.current }
  let(:config) { AppConfiguration.instance }

  it 'has an #before_update method' do
    # only test for the presence of the method bc it does nothing for now.
    service.before_update(config, current_user)
  end

  describe '#after_create' do
    it 'enqueues an Seo::UpdateGoogleHostJob job' do
      expect { service.after_create(config, current_user) }.to enqueue_job(Seo::UpdateGoogleHostJob)
    end
  end

  describe '#after_update' do
    it "logs a 'changed' action job when the configuration has changed" do
      settings = config.settings
      settings['core']['organization_name'] = { 'en' => 'New name' }

      config.update!(settings: settings)

      expect { service.after_update(config, current_user) }
        .to  enqueue_job(LogActivityJob).with(config, 'changed', current_user, config.updated_at.to_i)
        .and enqueue_job(LogActivityJob).with(tenant, 'changed', current_user, config.updated_at.to_i)
    end

    it "logs a 'changed_lifecycle_stage' action job when the lifecycle has changed" do
      old_lifecycle_stage = config.settings.dig('core', 'lifecycle_stage')
      config.settings['core']['lifecycle_stage'] = 'churned'
      config.save!

      options = { payload: { changes: [old_lifecycle_stage, 'churned'] } }
      updated_at = config.updated_at.to_i
      expect { service.after_update(config, current_user) }
        .to  enqueue_job(LogActivityJob).with(config, 'changed_lifecycle_stage', current_user, updated_at, options)
        .and enqueue_job(LogActivityJob).with(tenant, 'changed_lifecycle_stage', current_user, updated_at, options)
    end

    it "logs a 'changed_host' action job when the host has changed" do
      old_host = config.host
      new_host = 'seboslovakia.citizenlab.co'
      config.update! host: new_host

      options = { payload: { changes: [old_host, new_host] } }
      updated_at = config.updated_at.to_i
      expect { service.after_update(config, current_user) }
        .to  enqueue_job(LogActivityJob).with(config, 'changed_host', current_user, updated_at, options)
        .and enqueue_job(LogActivityJob).with(tenant, 'changed_host', current_user, updated_at, options)
        .and enqueue_job(Seo::UpdateGoogleHostJob)
    end
  end
end
