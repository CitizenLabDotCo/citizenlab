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
  end

end
