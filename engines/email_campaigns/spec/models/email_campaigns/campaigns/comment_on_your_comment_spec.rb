require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentOnYourComment, type: :model do
  describe "CommentOnYourComment Campaign default factory" do
    it "is valid" do
      expect(build(:comment_on_your_comment_campaign)).to be_valid
    end
  end

end
