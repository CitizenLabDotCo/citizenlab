# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Consent do
  describe 'Factory' do
    it { expect(build_stubbed(:consent)).to be_valid }
  end

  describe 'Deleting a user' do
    it 'deletes the associated Consent' do
      consent = create(:consent)
      consent.user.destroy
      expect { consent.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'create_all_for_user!' do
    it 'creates missing consents for all consentable campaign' do
      user = create(:user)

      expect_any_instance_of(EmailCampaigns::DeliveryService)
        .to receive(:consentable_campaign_types_for)
        .with(user)
        .and_return(%w[SomeMailingCampaign SomeOtherMailingCampaign])

      described_class.create_all_for_user!(user)

      expect(described_class.where(user: user).pluck(:campaign_type))
        .to match_array %w[SomeMailingCampaign SomeOtherMailingCampaign]
    end
  end

  describe 'idea_marked_as_spam_campaign' do
    let(:campaign) { create(:idea_marked_as_spam_campaign) }

    it { expect(campaign.class).to be_consentable_for build_stubbed(:admin) }
    it { expect(campaign.class).not_to be_consentable_for build_stubbed(:user) }
    it { expect(campaign.class).to be_consentable_for build_stubbed(:project_moderator) }
  end
end
