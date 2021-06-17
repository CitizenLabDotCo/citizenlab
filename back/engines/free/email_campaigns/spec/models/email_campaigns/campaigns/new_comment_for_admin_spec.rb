require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentForAdmin, type: :model do
  describe "NewCommentForAdmin Campaign default factory" do
    it "is valid" do
      expect(build(:new_comment_for_admin_campaign)).to be_valid
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it "filters out normal users (on idea)" do
      idea = create(:idea)
      comment = create(:comment, post: idea)

      _user = create(:user)
      admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to match_array([admin])
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it "filters out normal users (on initiative)" do
      initiative = create(:initiative)
      comment = create(:comment, post: initiative)
      user = create(:user)
      admin = create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: comment, action: 'created')).ids).to match_array([admin.id])
    end
  end

  describe "apply_recipient_filters" do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it "filters out everyone if the author is admin (on initiative)" do
      initiative = create(:initiative)
      comment = create(:comment, post: initiative, author: create(:admin))
      admin = create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: comment, action: 'created')).count).to eq 0
    end
  end
end
