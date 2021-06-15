# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewIdeaForAdmin, type: :model do
  let(:campaign) { build(:new_idea_for_admin_campaign) }

  describe 'NewIdeaForAdmin Campaign default factory' do
    it { expect(campaign).to be_valid }
  end

  describe 'apply_recipient_filters' do
    it 'filters out normal users' do
      idea = create(:idea)
      _user = create(:user)
      admin = create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published)).to match [admin]
    end
  end

  describe 'apply_recipient_filters' do
    it 'filters out everyone if the author is an admin' do
      project = create(:project)
      admin = create(:admin)
      idea = create(:idea, project: project, author: admin)
      _another_admin = create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published).count).to eq 0
    end
  end
end
