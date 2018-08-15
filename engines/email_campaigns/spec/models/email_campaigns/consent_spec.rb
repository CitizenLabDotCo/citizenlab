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

end
