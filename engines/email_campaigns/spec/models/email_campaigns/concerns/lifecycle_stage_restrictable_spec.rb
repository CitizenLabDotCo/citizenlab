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
    @tenant = Tenant.current
  end

  context "on a campaign limited to demo and active tenants" do
    before do
      @campaign = LifecycleStageActiveAndDemoCampaign.create
    end

    describe "run_before_send_hooks" do
      it "returns true when the tenant is active" do
        @tenant.settings['core']['lifecycle_stage'] = 'active'
        @tenant.save!
        expect(@campaign.run_before_send_hooks).to be_truthy
      end

      it "returns false when the tenant is churned" do
        @tenant.settings['core']['lifecycle_stage'] = 'churned'
        @tenant.save!
        expect(@campaign.run_before_send_hooks).to be_falsy
      end
    end
  end

  context "on a campaign limited to non-demo tenants" do
    before do
      @campaign = LifecycleStageNotChurnedCampaign.create
    end

    describe "run_before_send_hooks" do
      it "returns true when the tenant is active" do
        @tenant.settings['core']['lifecycle_stage'] = 'active'
        @tenant.save!
        expect(@campaign.run_before_send_hooks).to be_truthy
      end

      it "returns false when the tenant is demo" do
        @tenant.settings['core']['lifecycle_stage'] = 'demo'
        @tenant.save!
        expect(@campaign.run_before_send_hooks).to be_falsy
      end
    end
  end

end
