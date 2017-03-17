require 'rails_helper'

RSpec.describe Tenant, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:tenant)).to be_valid
    end
  end

  describe "Apartment tenant" do
    it "is created on create" do
      host = "something-else-than-the-default-test-tenant"
      expect(Apartment::Tenant).to receive(:create).with(host)
      create(:tenant, host: host)
    end

    it "is deleted on destroy" do
      t = create(:tenant, host: "something-else-than-the-default-test-tenant")
      expect(Apartment::Tenant).to receive(:drop).with(t.host)
      t.destroy
    end

    it "fails on a duplicate hostname" do
      create(:tenant)
      expect(build(:tenant)).to be_invalid
    end

    it "is valid when feature dependencies are met" do
      t = build(:tenant)
      t.settings['spaces'] = {
        "allowed" => true,
        "enabled" => true
      }
      t.settings['spaces_info'] = {
        "allowed" => true,
        "enabled" => true
      }
      expect(t).to be_valid
    end

    it "is invalid when feature dependencies are not met" do
      t = build(:tenant)
      t.settings['spaces'] = {
        "allowed" => false,
        "enabled" => false
      }
      t.settings['spaces_info'] = {
        "allowed" => true,
        "enabled" => true
      }
      expect{ t.valid? }.to change{ t.errors[:settings] }
    end
  end

  describe "Getting the current tenant" do
    it "succeeds with the correct tenant" do
      tenant = Tenant.find_by(host: 'example_org')
      expect(Tenant.current).to match(tenant)
    end
  end

  describe "Getting the settings of the current tenant" do
    it "succeeds when the setting is available" do
      expect(Tenant.settings 'core', 'default_locale').to eq('en')
    end

    it "raise an error when there is no current tenant" do
      Apartment::Tenant.switch('public') do
        expect{Tenant.settings 'core', 'default_locale'}.to raise_error(RuntimeError)
      end
    end

    it "returns nil when the setting does not exist" do
      expect(Tenant.settings 'core', 'gibberish').to be_nil
    end
  end

end
