require 'rails_helper'

class ActivityTriggerableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::ActivityTriggerable

  attr_accessor :activity_triggers
end

RSpec.describe EmailCampaigns::ActivityTriggerable, type: :model do
  before do
    @campaign = ActivityTriggerableCampaign.create
    @activity = create(:idea_published_activity)
  end
  
  describe "apply_send_filters" do
    it "returns true when the activity is part of the returned activity_triggers" do
      @campaign.activity_triggers = {
        "Idea" => {"published" => true},
        "Comment" => {"created" => true}
      }
      expect(@campaign.apply_send_filters(activity: @activity)).to be_truthy
    end

    it "returns false when the activity is not part of the returned activity_triggers" do
      @campaign.activity_triggers = {
        "Comment" => {"created" => true}
      }

      expect(@campaign.apply_send_filters(activity: @activity)).to be_falsy
    end

  end

end
