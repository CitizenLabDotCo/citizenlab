require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewIdeaForAdmin, type: :model do
  describe "NewIdeaForAdmin Campaign default factory" do
    it "is valid" do
      expect(build(:new_idea_for_admin_campaign)).to be_valid
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:new_idea_for_admin_campaign) }

    it "filters out normal users" do
      idea = create(:idea)
      user = create(:user)
      moderator = create(:moderator, project: idea.project)
      other_moderator = create(:moderator)
      admin = create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: idea, action: 'published')).map(&:id)).to match_array([admin.id, moderator.id])
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:new_idea_for_admin_campaign) }

    it "filters out everyone if the author is moderator" do
      project = create(:project)
      moderator = create(:moderator, project: project)
      idea = create(:idea, project: project, author: moderator)
      admin = create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: idea, action: 'published')).count).to eq 0
    end
  end
end
