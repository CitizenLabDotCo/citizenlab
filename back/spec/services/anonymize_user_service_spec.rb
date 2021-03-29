require "rails_helper"

describe AnonymizeUserService do
  let(:service) { AnonymizeUserService.new }

  describe "#anonymized_attributes" do
    before do
      create(:custom_field_birthyear)
      create(:custom_field_gender, :with_options)
      create(:custom_field_domicile)
      education = create(:custom_field_education, :with_options, enabled: true)
    end

    it "anonymizes confidential parts of the user's attributes" do 
      10.times do 
        user = create(:user)
        attributes = service.anonymized_attributes ['en'], user: user
        expect(User.new(attributes)).to be_valid

        attributes = service.anonymized_attributes ['en']
        expect(User.new(attributes)).to be_valid
      end
    end

  end
end
