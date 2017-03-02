require 'rails_helper'

RSpec.describe Tenant, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:tenant)).to be_valid
    end
  end

  describe "Apartment tenant" do
    it "is created on create" do
      t = build(:tenant)
      expect(Apartment::Tenant).to receive(:create).with(t.host)
      t.save
    end

    it "is deleted on destroy" do
      t = create(:tenant)
      expect(Apartment::Tenant).to receive(:drop).with(t.host)
      t.destroy
    end
  end

end
