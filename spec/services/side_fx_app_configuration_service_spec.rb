require 'rspec'

describe 'SideFxAppConfigurationService' do
  let(:service) { SideFxAppConfigurationService.new }
  let(:current_user) { create(:user) }

  it "has an #before_update method" do
    service.before_update(AppConfiguration.instance, current_user)
  end

  describe "after_update" do
    it "logs a 'changed' action job when the configuration has changed" do
      config = AppConfiguration.instance
      settings = config.settings
      settings['core']['organization_name'] = {'en' => "New name"}
      config.update!(settings: settings)

      expect { service.after_update(config, current_user) }
        .to have_enqueued_job(LogActivityJob)
        .with(config, 'changed', current_user, config.updated_at.to_i)
    end

    it "logs a 'changed_host' action job when the configuration host has changed" do
      config = AppConfiguration.instance
      old_host = config.host
      config.update!(host: 'some-domain.net')

      expect {service.after_update(config, current_user)}
        .to have_enqueued_job(LogActivityJob)
        .with(config, 'changed_host', current_user, config.updated_at.to_i, payload: {changes: [old_host, "some-domain.net"]})
    end

    it "logs a 'changed_lifecycle_stage' action job when the lifecycle has changed" do
      config = AppConfiguration.instance
      settings = config.settings
      old_lifecycle_stage = settings.dig('core', 'lifecycle_stage')
      settings['core']['lifecycle_stage'] = "churned"
      config.update!(settings: settings)

      expect {service.after_update(config, current_user)}
        .to have_enqueued_job(LogActivityJob)
        .with(config, 'changed_lifecycle_stage', current_user, config.updated_at.to_i, payload: {changes: [old_lifecycle_stage, "churned"]})
    end
  end
end
