require 'rails_helper'

class LifecycleStageActiveAndDemoCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::LifecycleStageRestrictable
  allow_lifecycle_stages only: ['demo','active']
end

class LifecycleStageNotChurnedCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::LifecycleStageRestrictable
  allow_lifecycle_stages except: ['demo']
end

RSpec.describe EmailCampaigns::LifecycleStageRestrictable, type: :model do

  before do
    @app_configuration = AppConfiguration.instance
  end

  context "on a campaign limited to demo and active platforms" do
    before do
      @campaign = LifecycleStageActiveAndDemoCampaign.create
    end

    describe "run_before_send_hooks" do
      it "returns true when the platform is active" do
        @app_configuration.settings['core']['lifecycle_stage'] = 'active'
        @app_configuration.save!
        expect(@campaign.run_before_send_hooks).to be_truthy
      end

      it "returns false when the platform is churned" do
        @app_configuration.settings['core']['lifecycle_stage'] = 'churned'
        @app_configuration.save!
        expect(@campaign.run_before_send_hooks).to be_falsy
      end
    end
  end

  context "on a campaign limited to non-demo platforms" do
    before do
      @campaign = LifecycleStageNotChurnedCampaign.create
    end

    describe "run_before_send_hooks" do
      it "returns true when the platform is active" do
        @app_configuration.settings['core']['lifecycle_stage'] = 'active'
        @app_configuration.save!
        expect(@campaign.run_before_send_hooks).to be_truthy
      end

      it "returns false when the platform is demo" do
        @app_configuration.settings['core']['lifecycle_stage'] = 'demo'
        @app_configuration.save!
        expect(@campaign.run_before_send_hooks).to be_falsy
      end
    end
  end

end
