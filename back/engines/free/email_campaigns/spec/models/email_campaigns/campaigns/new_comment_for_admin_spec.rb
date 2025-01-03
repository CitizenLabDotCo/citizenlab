# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewCommentForAdmin do
  describe 'NewCommentForAdmin Campaign default factory' do
    it 'is valid' do
      expect(build(:new_comment_for_admin_campaign)).to be_valid
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_comment_for_admin_campaign) }

    it 'filters out normal users' do
      idea = create(:idea)
      comment = create(:comment, idea: idea)

      _user = create(:user)
      admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to match_array([admin])
    end

    it 'filters out everyone if the author is admin' do
      idea = create(:idea)
      comment = create(:comment, idea: idea, author: create(:admin))
      create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: comment, action: 'created')).count).to eq 0
    end

    it 'filters out everyone if the author is moderator' do
      idea = create(:idea)
      moderator = create(:project_moderator, projects: [idea.project])
      comment = create(:comment, idea: idea, author: moderator)
      _admin = create(:admin)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created).count).to eq 0
    end

    it 'keeps moderators' do
      idea = create(:idea)
      comment = create(:comment, idea: idea)

      moderator = create(:project_moderator, projects: [idea.project])
      _other_moderator = create(:project_moderator)

      comment_created = create(:activity, item: comment, action: 'created')
      expect(campaign.apply_recipient_filters(activity: comment_created)).to match([moderator])
    end
  end
end
