# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentForAdmin, type: :model do
  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it 'keeps moderators' do
      idea = create(:idea)
      comment = create(:comment, post: idea)

      moderator = create(:project_moderator, projects: [idea.project])
      _other_moderator = create(:project_moderator)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to match([moderator])
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it 'filters out everyone if the author is moderator (on idea)' do
      idea = create(:idea)
      moderator = create(:project_moderator, projects: [idea.project])
      comment = create(:comment, post: idea, author: moderator)
      _admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created).count).to eq 0
    end
  end
end
