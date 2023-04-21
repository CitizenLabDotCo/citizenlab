# frozen_string_literal: true

require 'rails_helper'

class LifecycleStageActiveAndDemoCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::LifecycleStageRestrictable
  allow_lifecycle_stages only: %w[demo active]
end

class LifecycleStageNotChurnedCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::LifecycleStageRestrictable
  allow_lifecycle_stages except: ['demo']
end

RSpec.describe EmailCampaigns::LifecycleStageRestrictable do
  let(:app_configuration) { AppConfiguration.instance }

  context 'on a campaign limited to demo and active platforms' do
    let(:campaign) { LifecycleStageActiveAndDemoCampaignForTest.create! }

    describe 'run_before_send_hooks' do
      it 'returns true when the platform is active' do
        app_configuration.settings['core']['lifecycle_stage'] = 'active'
        app_configuration.save!
        expect(campaign.run_before_send_hooks).to be true
      end

      it 'returns false when the platform is churned' do
        app_configuration.settings['core']['lifecycle_stage'] = 'churned'
        app_configuration.save!
        expect(campaign.run_before_send_hooks).to be_falsy
      end
    end
  end

  context 'on a campaign limited to non-demo platforms' do
    let(:campaign) { LifecycleStageNotChurnedCampaignForTest.create! }

    describe 'run_before_send_hooks' do
      it 'returns true when the platform is active' do
        app_configuration.settings['core']['lifecycle_stage'] = 'active'
        app_configuration.save!
        expect(campaign.run_before_send_hooks).to be true
      end

      it 'returns false when the platform is demo' do
        app_configuration.settings['core']['lifecycle_stage'] = 'demo'
        app_configuration.update_column :settings, app_configuration.settings
        expect(campaign.run_before_send_hooks).to be_falsy
      end
    end
  end
end
