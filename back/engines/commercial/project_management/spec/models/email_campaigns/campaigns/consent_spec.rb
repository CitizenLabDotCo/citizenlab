# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Consent, type: :model do
  describe 'idea_marked_as_spam_campaign' do
    let(:campaign) { create(:idea_marked_as_spam_campaign) }

    it { expect(campaign.class).to be_consentable_for build_stubbed(:project_moderator) }
  end
end
