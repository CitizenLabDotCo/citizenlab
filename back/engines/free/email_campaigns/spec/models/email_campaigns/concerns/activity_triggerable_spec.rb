require 'rails_helper'


RSpec.describe EmailCampaigns::ActivityTriggerable, type: :model do
  before do
    class ActivityTriggerableCampaign < EmailCampaigns::Campaign
      include EmailCampaigns::ActivityTriggerable

      attr_accessor :activity_triggers
    end

    @campaign = ActivityTriggerableCampaign.create!
    @activity = create(:published_activity)
  end
  
  describe "run_before_send_hooks" do
    it "returns true when the activity is part of the returned activity_triggers" do
      @campaign.activity_triggers = {
        "Idea" => {"published" => true},
        "Comment" => {"created" => true}
      }
      expect(@campaign.run_before_send_hooks(activity: @activity)).to be_truthy
    end

    it "returns false when the activity is not part of the returned activity_triggers" do
      @campaign.activity_triggers = {
        "Comment" => {"created" => true}
      }

      expect(@campaign.run_before_send_hooks(activity: @activity)).to be_falsy
    end

    it "returns false if no activity is specified" do
      expect(@campaign.run_before_send_hooks).to be_falsy
    end

  end

end
