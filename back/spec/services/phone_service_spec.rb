require 'rails_helper'

describe PhoneService do
  let(:service) { subject }

  describe "phone_or_email" do
    it "detects phone numbers" do
      expect(service.phone_or_email("1-208-809-2788 x6972")).to eq :phone
      expect(service.phone_or_email("0468 13 14 76")).to eq :phone
      expect(service.phone_or_email("+32.2.386.98.09")).to eq :phone
      expect(service.phone_or_email("025261212")).to eq :phone
      expect(service.phone_or_email("0032 (0) 3 241 11 32")).to eq :phone
    end

    it "detects emails" do
      expect(service.phone_or_email("test@test.com")).to eq :email
      expect(service.phone_or_email("42.343.4656.6@123.net")).to eq :email
      expect(service.phone_or_email("+12@test.net")).to eq :email
    end

    it "returns nil when email nor phone number" do
      expect(service.phone_or_email("112")).to eq nil
      expect(service.phone_or_email("1234 text 34563")).to eq nil
      expect(service.phone_or_email("+123v44563")).to eq nil
      expect(service.phone_or_email("somethinghere@")).to eq nil
    end
  end

  describe "normalize_phone" do
    it "only retains digits" do
      expect(service.normalize_phone("1-510-887-4548 x63521")).to eq "1510887454863521"
      expect(service.normalize_phone("+324.364-12-12-12")).to eq "324364121212"
    end
  end
end

