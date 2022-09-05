# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : 'email_campaigns engine is not installed'

RSpec.describe 'EmailCampaigns::Campaigns::NewIdeaForAdmin', type: :model, skip: skip_reason do
  let(:campaign) { build(:new_idea_for_admin_campaign) }

  describe 'apply_recipient_filters' do
    it 'keeps moderators' do
      idea = create(:idea)
      moderator = create(:project_moderator, projects: [idea.project])
      _other_moderator = create(:project_moderator)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published)).to match([moderator])
    end
  end

  describe 'apply_recipient_filters' do
    it 'filters out everyone if the author is moderator' do
      project = create(:project)
      moderator = create(:project_moderator, projects: [project])
      idea = create(:idea, project: project, author: moderator)
      _admin = create(:admin)

      idea_published = create(:activity, item: idea, action: 'published')
      expect(campaign.apply_recipient_filters(activity: idea_published).count).to eq 0
    end
  end
end
