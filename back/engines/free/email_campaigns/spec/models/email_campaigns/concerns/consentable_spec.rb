# frozen_string_literal: true

require 'rails_helper'

class ConsentableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::Consentable
end

RSpec.describe EmailCampaigns::Consentable do
  before do
    @campaign = ConsentableCampaign.create
  end

  describe 'apply_recipient_filters' do
    it 'includes a user when the she consented with the campaign' do
      consent = create(:consent, campaign_type: @campaign.type)
      expect(@campaign.apply_recipient_filters.all).to include(consent.user)
    end

    it 'includes a user when no consent exists' do
      user = create(:user)
      expect(@campaign.apply_recipient_filters.all).to include(user)
    end

    it "doesn't include a user when consented is false" do
      consent = create(:consent, campaign_type: @campaign.type, consented: false)
      expect(@campaign.apply_recipient_filters.all).not_to include(consent.user)
    end
  end

  describe 'consentable_for?' do
    it 'returns true when the class does not implement #consentable_roles' do
      user = create(:user)
      expect(ConsentableCampaign.consentable_for?(user)).to be true
    end

    it 'returns false for a normal user when the class restricts consentable_roles to project_moderator' do
      user = create(:user)
      ConsentableCampaign.define_singleton_method(:consentable_roles) do
        %w[project_moderator]
      end
      expect(ConsentableCampaign.consentable_for?(user)).to be false
    end

    it 'returns true for an admin when the class restricts consentable_roles to admin' do
      admin = create(:admin)
      ConsentableCampaign.define_singleton_method(:consentable_roles) do
        %w[admin]
      end
      expect(ConsentableCampaign.consentable_for?(admin)).to be true
    end
  end
end
