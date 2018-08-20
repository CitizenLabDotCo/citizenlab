require 'rails_helper'

RSpec.describe EmailCampaigns::Consent, type: :model do
  describe "Consent default factory" do
    it "is valid" do
      expect(build(:consent)).to be_valid
    end
  end

  describe "Deleting a user" do
    it "deletes the associated Consent" do
      consent = create(:consent)
      consent.user.destroy
      expect{consent.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "create_all_for_user!" do
    it "creates missing consents for all consentable campaign" do
      user = create(:user)

      expect_any_instance_of(EmailCampaigns::DeliveryService)
        .to receive(:consentable_campaign_types_for)
        .with(user)
        .and_return(['SomeMailingCampaign','SomeOtherMailingCampaign'])

      EmailCampaigns::Consent.create_all_for_user!(user)

      expect(EmailCampaigns::Consent.where(user: user).pluck(:campaign_type))
        .to match_array ['SomeMailingCampaign','SomeOtherMailingCampaign']
    end
  end

end
