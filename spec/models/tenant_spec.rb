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
      t.settings['projects'] = {
        "allowed" => true,
        "enabled" => true
      }
      t.settings['projects_info'] = {
        "allowed" => true,
        "enabled" => true
      }
      expect(t).to be_valid
    end

    it "is invalid when feature dependencies are not met" do
      t = build(:tenant)
      t.settings['projects'] = {
        "allowed" => false,
        "enabled" => false
      }
      t.settings['projects_info'] = {
        "allowed" => true,
        "enabled" => true
      }
      expect{ t.valid? }.to change{ t.errors[:settings] }
    end
  end

  describe "Getting the current tenant" do
    it "succeeds with the correct tenant" do
      tenant = Tenant.find_by(host: 'example.org')
      expect(Tenant.current).to match(tenant)
    end
  end

  describe "Getting the settings of the current tenant" do
    it "succeeds when the setting is available" do
      expect(Tenant.settings 'core', 'timezone').to eq('Europe/Brussels')
    end

    it "raise an error when there is no current tenant" do
      Apartment::Tenant.switch('public') do
        expect{Tenant.settings 'core', 'timezone'}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    it "returns nil when the setting does not exist" do
      expect(Tenant.settings 'core', 'gibberish').to be_nil
    end
  end

  describe "closest_locale_to" do
    let(:tenant) { build(:tenant, host: 'something-else-than-the-default-test-tenant') }

    it "returns the locale itself if it's present" do
      tenant.settings['core']['locales'] = ['en', 'nl-BE']
      expect(tenant.closest_locale_to('nl-BE')).to eq 'nl-BE'
    end

    it "returns the first tenant locale when it's not present" do
      tenant.settings['core']['locales'] = ['en', 'nl-BE']
      expect(tenant.closest_locale_to('de-DE')).to eq 'en'
    end
  end

end
