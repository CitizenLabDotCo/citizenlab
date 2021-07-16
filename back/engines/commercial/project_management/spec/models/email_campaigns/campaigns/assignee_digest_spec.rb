# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : 'email_campaigns engine is not installed'

RSpec.describe 'EmailCampaigns::Campaigns::AssigneeDigest', type: :model, skip: skip_reason do
  describe '#apply_recipient_filters' do
    it 'keeps moderators' do
      moderator = create(:project_moderator)
      campaign = build(:assignee_digest_campaign)
      expect(campaign.apply_recipient_filters.map(&:id)).to match_array([moderator.id])
    end
  end
end

