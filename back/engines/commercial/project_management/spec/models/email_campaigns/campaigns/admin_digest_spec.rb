# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : 'email_campaigns engine is not installed'

RSpec.describe EmailCampaigns::Campaigns::AdminDigest, type: :model, skip: skip_reason do
  describe 'apply_recipient_filters' do
    let(:campaign) { build(:admin_digest_campaign) }

    it 'filters out moderators' do
      admin = create(:admin)
      _moderator = create(:project_moderator)

      expect(campaign.apply_recipient_filters).to match([admin])
    end
  end
end
