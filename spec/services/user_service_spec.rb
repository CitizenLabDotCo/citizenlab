require "rails_helper"

describe UserService do
  let(:service) { UserService.new }

  describe "#anonymized_attributes" do

    it "anonymizes confidential parts of the user's attributes" do
      user = create(:user)
      attributes = service.anonymized_attributes 'en', user: user
      User.create! attributes
    end

  end
end
