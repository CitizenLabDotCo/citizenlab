require "rails_helper"

describe Onboarding::OnboardingService do
  let(:service) { Onboarding::OnboardingService.new }

  describe "current_campaign" do

    let(:custom_field) { create(:custom_field) }
    let(:user) { create(:user,
      bio_multiloc: {en: "I'm a great bloke"},
      custom_field_values: {custom_field.key => "Quite often"}
    ) }

    it "raises an error when no user is passed" do
      expect{service.current_campaign(nil)}.to raise_error ArgumentError
    end

    it "returns :complete_profile when the user has an empty bio" do
      user.update(bio_multiloc: {})
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it "returns :complete_profile when the user has empty signup fields" do
      user.update(custom_field_values: {})
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it "returns :complete_profile when the user has no avatar configured" do
      user.remove_avatar!
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it "returns :custom_cta when a custom message is configured" do
      tenant = Tenant.current
      tenant.settings['core']['custom_onboarding_message'] = {
        en: "Do the hippy shake"
      }
      tenant.save
      expect(service.current_campaign(user)).to eq :custom_cta
    end

    it "returns :default when no custom message is configured" do
      expect(service.current_campaign(user)).to eq :default
    end

  end

end
